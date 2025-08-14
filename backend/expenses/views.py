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
            
            # Create a prompt for the LLM (biased to map groceries → Food)
            prompt = f"""
            Classify the expense description into ONE of:
            Food, Entertainment, Transport, Shopping, Bills, Healthcare, Education, Travel, Home, Other.

            Rules:
            - Return ONLY the category name.
            - Groceries (milk, curd/yogurt, paneer, bread, butter, cheese, vegetables, fruits, banana, apple, eggs, rice, wheat/flour/atta, dal/lentils/pulses, oil, spices, sugar, tea, coffee, grocery/supermarket/kirana) => Food.
            - Restaurant, meal, delivery, cafe, snack => Food.
            - If unsure between Food and Shopping, choose Food.

            Description: "{description}"
            Category:
            """
            
            payload = {
                "model": "llama3.2",  # You can change this to any model you have
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,  # Low temperature for consistent results
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
                
                # Keyword hinting: prefer deterministic mapping for groceries → Food
                def keyword_hint(text: str):
                    t = text.lower()
                    grocery_words = ['milk', 'curd', 'yogurt', 'paneer', 'butter', 'cheese', 'bread', 'vegetable', 'veggies', 'fruit', 'banana', 'apple', 'egg', 'eggs', 'rice', 'wheat', 'atta', 'flour', 'dal', 'lentil', 'lentils', 'pulse', 'pulses', 'oil', 'spice', 'spices', 'sugar', 'salt', 'tea', 'coffee', 'grocery', 'supermarket', 'kirana']
                    return 'Food' if any(w in t for w in grocery_words) else None

                hint = keyword_hint(description)

                # Find exact match first
                if category in valid_categories:
                    if hint and category != hint:
                        return hint
                    return category
                
                # Try to find partial matches
                for valid_cat in valid_categories:
                    if valid_cat.lower() in category.lower() or category.lower() in valid_cat.lower():
                        return hint or valid_cat
                
                # Default fallback
                return hint or 'Other'
            else:
                # Fallback to keyword-based detection if Ollama fails
                return self._fallback_category_detection(description, amount)
                
        except Exception as e:
            print(f"Ollama API error: {e}")
            # Fallback to keyword-based detection
            return self._fallback_category_detection(description, amount)
    
    def _fallback_category_detection(self, description, amount):
        """Fallback category detection using keywords"""
        description_lower = description.lower()
        
        grocery_words = ['milk', 'curd', 'yogurt', 'paneer', 'butter', 'cheese', 'bread', 'vegetable', 'veggies', 'fruit', 'banana', 'apple', 'egg', 'eggs', 'rice', 'wheat', 'atta', 'flour', 'dal', 'lentil', 'lentils', 'pulse', 'pulses', 'oil', 'spice', 'spices', 'sugar', 'salt', 'tea', 'coffee', 'grocery', 'supermarket', 'kirana']
        if any(word in description_lower for word in grocery_words):
            return 'Food'

        if any(word in description_lower for word in ['food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'grocery', 'pizza', 'burger', 'coffee', 'tea', 'snack', 'meal', 'cafe', 'bakery', 'sweets', 'chocolate', 'ice cream', 'juice', 'water']):
            return 'Food'
        elif any(word in description_lower for word in ['movie', 'cinema', 'theatre', 'game', 'concert', 'party', 'show', 'ticket', 'entertainment', 'fun', 'amusement', 'park', 'museum', 'exhibition', 'festival', 'event', 'booking', 'reservation']):
            return 'Entertainment'
        elif any(word in description_lower for word in ['uber', 'taxi', 'cab', 'fuel', 'gas', 'parking', 'bus', 'train', 'metro', 'subway', 'flight', 'airplane', 'car', 'bike', 'scooter', 'maintenance', 'repair', 'insurance', 'toll', 'fare']):
            return 'Transport'
        elif any(word in description_lower for word in ['shirt', 'shoes', 'dress', 'clothes', 'fashion', 'shopping', 'store', 'mall', 'market', 'shop', 'buy', 'purchase', 'retail', 'electronics', 'phone', 'laptop', 'accessories', 'jewelry']):
            return 'Shopping'
        elif any(word in description_lower for word in ['electricity', 'water', 'internet', 'rent', 'bill', 'utility', 'phone', 'mobile', 'subscription', 'service', 'maintenance', 'insurance', 'tax', 'fees', 'charges']):
            return 'Bills'
        elif any(word in description_lower for word in ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical', 'health', 'dental', 'eye', 'vision', 'therapy', 'treatment', 'consultation', 'prescription', 'vitamins', 'supplements']):
            return 'Healthcare'
        elif any(word in description_lower for word in ['course', 'book', 'training', 'workshop', 'education', 'school', 'college', 'university', 'class', 'lesson', 'tutorial']):
            return 'Education'
        elif any(word in description_lower for word in ['hotel', 'vacation', 'tourism', 'travel', 'trip', 'journey', 'flight', 'accommodation', 'resort', 'lodging']):
            return 'Travel'
        elif any(word in description_lower for word in ['furniture', 'repair', 'maintenance', 'household', 'home', 'kitchen', 'bathroom', 'bedroom', 'living room', 'garden', 'yard']):
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
        # Here you could add OCR processing logic
        # For now, we'll just save the receipt
        serializer.save()
