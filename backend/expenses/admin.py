from django.contrib import admin
from .models import ExpenseCategory, ExpenseGroup, Expense, ExpenseSplit, ExpenseReceipt

@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ExpenseGroup)
class ExpenseGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'member_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description', 'created_by__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['members']

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = [
        'description', 'amount', 'currency', 'category', 'paid_by', 
        'date', 'group', 'payment_status', 'is_split', 'ai_detected_category'
    ]
    list_filter = [
        'category', 'group', 'payment_status', 'split_type', 
        'is_split', 'date', 'created_at'
    ]
    search_fields = [
        'description', 'paid_by__email', 'group__name', 
        'category__name', 'ai_detected_category'
    ]
    ordering = ['-date', '-created_at']
    readonly_fields = [
        'created_at', 'updated_at', 'ai_detected_category', 
        'ai_confidence', 'final_category', 'is_ai_detected'
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('description', 'amount', 'currency', 'date', 'time', 'location')
        }),
        ('Categorization', {
            'fields': ('category', 'custom_category', 'ai_detected_category', 'ai_confidence')
        }),
        ('Group & Splitting', {
            'fields': ('group', 'paid_by', 'split_type', 'is_split')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'payment_status')
        }),
        ('Additional Information', {
            'fields': ('notes', 'receipt_image', 'tags')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'category', 'group', 'paid_by', 'created_by'
        )

@admin.register(ExpenseSplit)
class ExpenseSplitAdmin(admin.ModelAdmin):
    list_display = [
        'expense', 'user', 'amount', 'percentage', 'is_paid', 'paid_at'
    ]
    list_filter = ['is_paid', 'created_at']
    search_fields = [
        'expense__description', 'user__email', 'expense__group__name'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['is_paid']

@admin.register(ExpenseReceipt)
class ExpenseReceiptAdmin(admin.ModelAdmin):
    list_display = [
        'expense', 'extracted_amount', 'extracted_date', 
        'extracted_merchant', 'confidence_score'
    ]
    list_filter = ['created_at', 'confidence_score']
    search_fields = [
        'expense__description', 'extracted_merchant', 'ocr_text'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    fieldsets = (
        ('Receipt Information', {
            'fields': ('expense', 'image')
        }),
        ('OCR Data', {
            'fields': ('ocr_text', 'extracted_amount', 'extracted_date', 'extracted_merchant', 'confidence_score')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
