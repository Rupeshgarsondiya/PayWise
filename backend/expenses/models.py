from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()

class ExpenseCategory(models.Model):
    """Model for expense categories"""
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, default='📝')
    color = models.CharField(max_length=7, default='#667eea')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Expense Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class ExpenseGroup(models.Model):
    """Model for expense groups (e.g., trips, roommates, etc.)"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    members = models.ManyToManyField(User, related_name='member_groups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class Expense(models.Model):
    """Model for individual expenses"""
    PAYMENT_STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    ]

    SPLIT_TYPE_CHOICES = [
        ('equal', 'Equal Split'),
        ('percentage', 'Percentage Split'),
        ('custom', 'Custom Amount'),
    ]

    # Basic expense information
    description = models.CharField(max_length=500)
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    currency = models.CharField(max_length=3, default='INR')
    
    # Categorization
    category = models.ForeignKey(
        ExpenseCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    custom_category = models.CharField(max_length=100, blank=True)
    
    # Timing and location
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    
    # Group and splitting
    group = models.ForeignKey(
        ExpenseGroup, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    paid_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='paid_expenses'
    )
    
    # Payment details
    payment_method = models.CharField(max_length=100, blank=True)
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS_CHOICES, 
        default='paid'
    )
    
    # Splitting configuration
    split_type = models.CharField(
        max_length=20, 
        choices=SPLIT_TYPE_CHOICES, 
        default='equal'
    )
    is_split = models.BooleanField(default=False)
    
    # AI and automation
    ai_detected_category = models.CharField(max_length=100, blank=True)
    ai_confidence = models.FloatField(null=True, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_expenses'
    )

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['category']),
            models.Index(fields=['group']),
            models.Index(fields=['paid_by']),
        ]

    def __str__(self):
        return f"{self.description} - ₹{self.amount} ({self.date})"

    @property
    def final_category(self):
        """Returns the final category (AI detected or manually selected)"""
        return self.category.name if self.category else self.ai_detected_category or self.custom_category

    @property
    def is_ai_detected(self):
        """Returns True if category was detected by AI"""
        return bool(self.ai_detected_category)

class ExpenseSplit(models.Model):
    """Model for tracking how expenses are split among group members"""
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expense_splits')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    percentage = models.FloatField(null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['expense', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} owes ₹{self.amount} for {self.expense.description}"

class ExpenseReceipt(models.Model):
    """Model for storing receipt images and OCR data"""
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='receipts')
    image = models.ImageField(upload_to='receipts/')
    ocr_text = models.TextField(blank=True)
    extracted_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    extracted_date = models.DateField(null=True, blank=True)
    extracted_merchant = models.CharField(max_length=200, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Receipt for {self.expense.description}"
