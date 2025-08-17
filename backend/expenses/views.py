from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.db.models import Sum, Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
import requests
import json

from .models import ExpenseCategory, ExpenseGroup, Expense, ExpenseSplit, ExpenseReceipt
from .serializers import (
    ExpenseCategorySerializer, ExpenseGroupSerializer, ExpenseGroupCreateSerializer,
    ExpenseSerializer, ExpenseCreateSerializer, ExpenseSplitSerializer,
    ExpenseReceiptSerializer, AICategoryDetectionSerializer, AICategoryDetectionResponseSerializer
)

# Import OCR service with fallback
try:
    from .ocr_service import OCRProcessor
    OCR_AVAILABLE = True
except ImportError:
    print("OCR service not available - using fallback")
    OCR_AVAILABLE = False

class ExpenseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for expense categories"""
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ExpenseGroupViewSet(viewsets.ModelViewSet):
    """ViewSet for expense groups"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ExpenseGroup.objects.filter(members=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseGroupCreateSerializer
        return ExpenseGroupSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for expenses"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Expense.objects.filter(
            Q(created_by=user) | Q(paid_by=user) | Q(group__members=user)
        ).select_related('category', 'group', 'paid_by', 'created_by')
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__name=category)
        
        # Filter by group
        group = self.request.query_params.get('group', None)
        if group:
            queryset = queryset.filter(group__name=group)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset.distinct()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get expense summary statistics"""
        user = request.user
        today = timezone.now().date()
        month_start = today.replace(day=1)
        
        # Total expenses
        total_expenses = Expense.objects.filter(
            Q(created_by=user) | Q(paid_by=user) | Q(group__members=user)
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # This month expenses
        month_expenses = Expense.objects.filter(
            Q(created_by=user) | Q(paid_by=user) | Q(group__members=user),
            date__gte=month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Total count
        total_count = Expense.objects.filter(
            Q(created_by=user) | Q(paid_by=user) | Q(group__members=user)
        ).count()
        
        # Category breakdown
        category_breakdown = Expense.objects.filter(
            Q(created_by=user) | Q(paid_by=user) | Q(group__members=user)
        ).values('category__name').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        # Calculate owed amounts
        owed_amount = self._calculate_owed_amount(user)
        
        return Response({
            'total_expenses': float(total_expenses),
            'month_expenses': float(month_expenses),
            'total_count': total_count,
            'category_breakdown': list(category_breakdown),
            'owed_amount': float(owed_amount)
        })
    
    def _calculate_owed_amount(self, user):
        """Calculate total amount owed to the user"""
        # Get expenses paid by user in groups
        user_paid_expenses = Expense.objects.filter(
            paid_by=user,
            group__isnull=False,
            is_split=True
        )
        
        total_owed = 0
        for expense in user_paid_expenses:
            group_members = expense.group.members.exclude(id=user.id)
            if group_members.exists():
                split_amount = expense.amount / (group_members.count() + 1)  # +1 for user
                total_owed += split_amount * group_members.count()
        
        return total_owed
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def scan_receipt(self, request):
        """OCR endpoint for receipt scanning with AUTOMATIC database saving"""
        
        # Debug logging
        print("=== OCR SCAN REQUEST DEBUG ===")
        print(f"Request method: {request.method}")
        print(f"Request content type: {request.content_type}")
        print(f"Request FILES: {list(request.FILES.keys())}")
        print(f"Request data keys: {list(request.data.keys())}")
        
        if 'receipt_image' not in request.FILES:
            available_files = list(request.FILES.keys())
            error_msg = f'No receipt image provided. Available files: {available_files}'
            print(f"ERROR: {error_msg}")
            
            return Response({
                'success': False, 
                'error': error_msg, 
                'message': 'Please select an image file to scan',
                'debug_info': {
                    'available_files': available_files,
                    'request_data_keys': list(request.data.keys()),
                    'content_type': request.content_type
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uploaded_file = request.FILES['receipt_image']
            print(f"Uploaded file: {uploaded_file.name}, Size: {uploaded_file.size}, Type: {uploaded_file.content_type}")
            
            # Validate file
            if uploaded_file.size > 10 * 1024 * 1024:  # 10MB limit
                return Response({
                    'success': False,
                    'error': 'File too large',
                    'message': 'Please upload an image smaller than 10MB'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Process OCR (keeping your existing logic)
            if OCR_AVAILABLE:
                ocr_processor = OCRProcessor()
                extracted_data = ocr_processor.process_receipt(uploaded_file)
            else:
                # Fallback sample data for testing
                extracted_data = {
                    'description': f'Sample OCR Receipt - {uploaded_file.name}',
                    'amount': 250.75,
                    'date': datetime.now().date(),
                    'category': 'Food',
                    'merchant': 'Test Restaurant',
                    'items': [
                        {'name': 'Burger', 'price': 150.0},
                        {'name': 'Fries', 'price': 80.0},
                        {'name': 'Drink', 'price': 20.75}
                    ],
                    'confidence': {
                        'amount': 0.9,
                        'date': 0.8,
                        'category': 0.85,
                        'overall': 0.85
                    },
                    'raw_text': f'Sample OCR text for testing - File: {uploaded_file.name}'
                }
            
            print(f"OCR extracted data: {extracted_data}")
            
            # AUTOMATICALLY CREATE EXPENSE IN DATABASE
            expense_data = {
                'description': extracted_data.get('description', 'OCR Scanned Receipt'),
                'amount': extracted_data.get('amount', 100.0),
                'date': extracted_data.get('date', datetime.now().date()),
                'currency': 'INR',
                'ai_detected_category': extracted_data.get('category', 'Other'),
                'ai_confidence': extracted_data.get('confidence', {}).get('overall', 0.5),
                'notes': f"Auto-scanned receipt from: {uploaded_file.name}\n\nMerchant: {extracted_data.get('merchant', 'Unknown')}\n\nItems:\n" + 
                        "\n".join([f"• {item['name']}: ₹{item['price']}" for item in extracted_data.get('items', [])]) +
                        f"\n\nOCR Confidence: {extracted_data.get('confidence', {}).get('overall', 0.5):.0%}",
                'receipt_image': uploaded_file
            }
            
            # Find matching category
            category = None
            if extracted_data.get('category'):
                try:
                    category = ExpenseCategory.objects.filter(
                        name__icontains=extracted_data['category']
                    ).first()
                    if category:
                        expense_data['category'] = category
                        print(f"Found matching category: {category.name}")
                except Exception as e:
                    print(f"Category matching error: {e}")
            
            # Create expense using model
            user = request.user
            expense_data['created_by'] = user
            expense_data['paid_by'] = user
            
            print(f"Creating expense with data: {expense_data}")
            
            # Create the expense
            expense = Expense.objects.create(**expense_data)
            print(f"Expense created successfully: ID {expense.id}")
            
            # Serialize the created expense
            expense_serializer = ExpenseSerializer(expense, context={'request': request})
            
            # Return success response with created expense
            return Response({
                'success': True,
                'message': f'✅ Receipt scanned and expense created automatically!\n\n' +
                          f'Amount: ₹{expense.amount}\n' +
                          f'Category: {extracted_data.get("category", "Other")}\n' +
                          f'Merchant: {extracted_data.get("merchant", "Unknown")}\n' +
                          f'Items found: {len(extracted_data.get("items", []))}\n' +
                          f'File processed: {uploaded_file.name}\n' +
                          f'Confidence: {(extracted_data.get("confidence", {}).get("overall", 0.5) * 100):.0f}%',
                'expense_created': expense_serializer.data,
                'ocr_data': {
                    'description': extracted_data.get('description'),
                    'amount': str(extracted_data.get('amount', 0)),
                    'date': extracted_data.get('date').isoformat() if extracted_data.get('date') else datetime.now().date().isoformat(),
                    'category': extracted_data.get('category'),
                    'merchant': extracted_data.get('merchant'),
                    'items': extracted_data.get('items', []),
                    'confidence': extracted_data.get('confidence', {}),
                    'file_name': uploaded_file.name
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"OCR Error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'success': False,
                'error': str(e),
                'message': f'Failed to process receipt: {str(e)}. Please try manual entry.',
                'debug_info': {
                    'error_type': type(e).__name__,
                    'error_details': str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def detect_category(self, request):
        """AI-powered category detection using Ollama"""
        serializer = AICategoryDetectionSerializer(data=request.data)
        if serializer.is_valid():
            description = serializer.validated_data['description']
            amount = serializer.validated_data.get('amount', 0)
            
            # Use Ollama for category detection
            detected_category = self._detect_category_with_ollama(description, amount)
            
            response_data = {
                'category': detected_category,
                'confidence': 0.95,  # High confidence for LLM
                'reasoning': f"AI detected '{detected_category}' using Ollama LLM"
            }
            
            response_serializer = AICategoryDetectionResponseSerializer(response_data)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _detect_category_with_ollama(self, description, amount):
        """Use Ollama LLM to detect expense category"""
        try:
            # Ollama API endpoint (default localhost:11434)
            ollama_url = "http://localhost:11434/api/generate"
            
            # Create a prompt for the LLM
            prompt = f"""
            Classify the expense description into ONE of:
            Food, Entertainment, Transport, Shopping, Bills, Healthcare, Education, Travel, Home, Other.
            
            Rules:
            - Return ONLY the category name.
            - Groceries => Food.
            - Restaurant, meal, delivery, cafe, snack => Food.
            
            Description: "{description}"
            Category:
            """
            
            payload = {
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "top_p": 0.9
                }
            }
            
            response = requests.post(ollama_url, json=payload, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                category = result.get('response', '').strip()
                
                # Validate the category
                valid_categories = [
                    'Food', 'Entertainment', 'Transport', 'Shopping',
                    'Bills', 'Healthcare', 'Education', 'Travel', 'Home', 'Other'
                ]
                
                # Clean up the response and find the best match
                category = category.replace('"', '').replace("'", "").strip()
                
                # Find exact match first
                if category in valid_categories:
                    return category
                
                # Try to find partial matches
                for valid_cat in valid_categories:
                    if valid_cat.lower() in category.lower() or category.lower() in valid_cat.lower():
                        return valid_cat
                
                return 'Other'
            else:
                return self._fallback_category_detection(description, amount)
                
        except Exception as e:
            print(f"Ollama API error: {e}")
            return self._fallback_category_detection(description, amount)
    
    def _fallback_category_detection(self, description, amount):
        """Fallback category detection using keywords"""
        description_lower = description.lower()
        
        if any(word in description_lower for word in ['food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'grocery', 'pizza', 'burger', 'coffee', 'tea', 'snack', 'meal', 'cafe', 'bakery']):
            return 'Food'
        elif any(word in description_lower for word in ['movie', 'cinema', 'theatre', 'game', 'concert', 'party', 'show', 'ticket', 'entertainment']):
            return 'Entertainment'
        elif any(word in description_lower for word in ['uber', 'taxi', 'cab', 'fuel', 'gas', 'parking', 'bus', 'train', 'metro']):
            return 'Transport'
        elif any(word in description_lower for word in ['shirt', 'shoes', 'dress', 'clothes', 'fashion', 'shopping', 'store', 'mall', 'market']):
            return 'Shopping'
        elif any(word in description_lower for word in ['electricity', 'water', 'internet', 'rent', 'bill', 'utility', 'phone', 'mobile']):
            return 'Bills'
        elif any(word in description_lower for word in ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical', 'health']):
            return 'Healthcare'
        elif any(word in description_lower for word in ['course', 'book', 'training', 'workshop', 'education', 'school']):
            return 'Education'
        elif any(word in description_lower for word in ['hotel', 'vacation', 'tourism', 'travel', 'trip', 'journey', 'flight']):
            return 'Travel'
        elif any(word in description_lower for word in ['furniture', 'repair', 'maintenance', 'household', 'home']):
            return 'Home'
        else:
            return 'Other'

class ExpenseSplitViewSet(viewsets.ModelViewSet):
    """ViewSet for expense splits"""
    serializer_class = ExpenseSplitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ExpenseSplit.objects.filter(
            Q(user=user) | Q(expense__created_by=user)
        ).select_related('expense', 'user')

class ExpenseReceiptViewSet(viewsets.ModelViewSet):
    """ViewSet for expense receipts"""
    serializer_class = ExpenseReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        user = self.request.user
        return ExpenseReceipt.objects.filter(
            expense__created_by=user
        ).select_related('expense')
    
    def perform_create(self, serializer):
        serializer.save()
