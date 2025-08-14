from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.ExpenseCategoryViewSet)
router.register(r'groups', views.ExpenseGroupViewSet, basename='expensegroup')
router.register(r'expenses', views.ExpenseViewSet, basename='expense')
router.register(r'splits', views.ExpenseSplitViewSet, basename='expensesplit')
router.register(r'receipts', views.ExpenseReceiptViewSet, basename='expensereceipt')

urlpatterns = [
    path('', include(router.urls)),
]
