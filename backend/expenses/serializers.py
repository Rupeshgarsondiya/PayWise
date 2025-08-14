from rest_framework import serializers
from .models import ExpenseCategory, ExpenseGroup, Expense, ExpenseSplit, ExpenseReceipt
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']

class ExpenseCategorySerializer(serializers.ModelSerializer):
    """Serializer for expense categories"""
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'icon', 'color', 'created_at']

class ExpenseGroupSerializer(serializers.ModelSerializer):
    """Serializer for expense groups"""
    members = UserSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseGroup
        fields = [
            'id', 'name', 'description', 'created_by', 'members', 
            'member_count', 'created_at', 'updated_at'
        ]

    def get_member_count(self, obj):
        return obj.members.count()

class ExpenseGroupCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating expense groups"""
    class Meta:
        model = ExpenseGroup
        fields = ['name', 'description']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        group = super().create(validated_data)
        # Add creator as a member
        group.members.add(self.context['request'].user)
        return group

class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for expenses"""
    category = ExpenseCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)
    group = ExpenseGroupSerializer(read_only=True)
    group_id = serializers.IntegerField(write_only=True, required=False)
    paid_by = UserSerializer(read_only=True)
    paid_by_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    created_by = UserSerializer(read_only=True)
    final_category = serializers.CharField(read_only=True)
    is_ai_detected = serializers.BooleanField(read_only=True)
    
    # AI category detection
    ai_detected_category = serializers.CharField(read_only=True)
    ai_confidence = serializers.FloatField(read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'description', 'amount', 'currency', 'category', 'category_id',
            'custom_category', 'date', 'time', 'location', 'group', 'group_id',
            'paid_by', 'paid_by_id', 'payment_method', 'payment_status',
            'split_type', 'is_split', 'ai_detected_category', 'ai_confidence',
            'notes', 'receipt_image', 'tags', 'final_category', 'is_ai_detected',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def create(self, validated_data):
        # Set the current user as creator and paid_by if not specified
        user = self.context['request'].user
        validated_data['created_by'] = user
        
        if 'paid_by_id' not in validated_data:
            validated_data['paid_by'] = user
        
        # Handle category
        if 'category_id' in validated_data:
            try:
                category = ExpenseCategory.objects.get(id=validated_data.pop('category_id'))
                validated_data['category'] = category
            except ExpenseCategory.DoesNotExist:
                pass
        
        # Handle group
        if 'group_id' in validated_data:
            try:
                group = ExpenseGroup.objects.get(id=validated_data.pop('group_id'))
                validated_data['group'] = group
            except ExpenseGroup.DoesNotExist:
                pass
        
        # Handle paid_by
        if 'paid_by_id' in validated_data:
            paid_by_raw = validated_data.pop('paid_by_id')
            if paid_by_raw is None:
                validated_data['paid_by'] = user
            else:
                try:
                    paid_by = User.objects.get(id=paid_by_raw)
                    validated_data['paid_by'] = paid_by
                except User.DoesNotExist:
                    validated_data['paid_by'] = user
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle category
        if 'category_id' in validated_data:
            try:
                category = ExpenseCategory.objects.get(id=validated_data.pop('category_id'))
                validated_data['category'] = category
            except ExpenseCategory.DoesNotExist:
                pass
        
        # Handle group
        if 'group_id' in validated_data:
            try:
                group = ExpenseGroup.objects.get(id=validated_data.pop('group_id'))
                validated_data['group'] = group
            except ExpenseGroup.DoesNotExist:
                pass
        
        # Handle paid_by
        if 'paid_by_id' in validated_data:
            paid_by_raw = validated_data.pop('paid_by_id')
            if paid_by_raw is not None:
                try:
                    paid_by = User.objects.get(id=paid_by_raw)
                    validated_data['paid_by'] = paid_by
                except User.DoesNotExist:
                    pass
        
        return super().update(instance, validated_data)

class ExpenseCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating expenses"""
    category_id = serializers.IntegerField(required=False)
    group_id = serializers.IntegerField(required=False)
    paid_by_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Expense
        fields = [
            'description', 'amount', 'currency', 'category_id', 'date',
            'group_id', 'paid_by_id', 'payment_method', 'notes'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        
        # Set default values
        if 'currency' not in validated_data:
            validated_data['currency'] = 'INR'
        
        if 'paid_by_id' not in validated_data:
            validated_data['paid_by'] = user
        
        # Handle category
        if 'category_id' in validated_data:
            try:
                category = ExpenseCategory.objects.get(id=validated_data.pop('category_id'))
                validated_data['category'] = category
            except ExpenseCategory.DoesNotExist:
                pass
        
        # Handle group
        if 'group_id' in validated_data:
            try:
                group = ExpenseGroup.objects.get(id=validated_data.pop('group_id'))
                validated_data['group'] = group
            except ExpenseGroup.DoesNotExist:
                pass
        
        # Handle paid_by
        if 'paid_by_id' in validated_data:
            paid_by_raw = validated_data.pop('paid_by_id')
            if paid_by_raw is None:
                validated_data['paid_by'] = user
            else:
                try:
                    paid_by = User.objects.get(id=paid_by_raw)
                    validated_data['paid_by'] = paid_by
                except User.DoesNotExist:
                    validated_data['paid_by'] = user
        
        return super().create(validated_data)

class ExpenseSplitSerializer(serializers.ModelSerializer):
    """Serializer for expense splits"""
    user = UserSerializer(read_only=True)
    expense = ExpenseSerializer(read_only=True)

    class Meta:
        model = ExpenseSplit
        fields = [
            'id', 'expense', 'user', 'amount', 'percentage', 
            'is_paid', 'paid_at', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ExpenseReceiptSerializer(serializers.ModelSerializer):
    """Serializer for expense receipts"""
    expense = serializers.PrimaryKeyRelatedField(queryset=Expense.objects.all())

    class Meta:
        model = ExpenseReceipt
        fields = [
            'id', 'expense', 'image', 'ocr_text', 'extracted_amount',
            'extracted_date', 'extracted_merchant', 'confidence_score', 'created_at'
        ]
        read_only_fields = ['ocr_text', 'extracted_amount', 'extracted_date', 
                           'extracted_merchant', 'confidence_score', 'created_at']

class AICategoryDetectionSerializer(serializers.Serializer):
    """Serializer for AI category detection requests"""
    description = serializers.CharField(max_length=500)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    context = serializers.CharField(max_length=1000, required=False)

class AICategoryDetectionResponseSerializer(serializers.Serializer):
    """Serializer for AI category detection responses"""
    category = serializers.CharField(max_length=100)
    confidence = serializers.FloatField(min_value=0.0, max_value=1.0)
    alternatives = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    reasoning = serializers.CharField(max_length=500, required=False)
