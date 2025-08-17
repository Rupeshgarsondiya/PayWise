from django.core.management.base import BaseCommand
from expenses.models import ExpenseCategory

class Command(BaseCommand):
    help = 'Populate default expense categories'
    
    def handle(self, *args, **options):
        categories = [
            {'name': 'Food', 'icon': '🍽️', 'color': '#ff6b6b'},
            {'name': 'Transport', 'icon': '🚗', 'color': '#4ecdc4'},
            {'name': 'Shopping', 'icon': '🛍️', 'color': '#45b7d1'},
            {'name': 'Entertainment', 'icon': '🎬', 'color': '#96ceb4'},
            {'name': 'Bills', 'icon': '📄', 'color': '#ffeaa7'},
            {'name': 'Healthcare', 'icon': '🏥', 'color': '#fd79a8'},
            {'name': 'Education', 'icon': '📚', 'color': '#fdcb6e'},
            {'name': 'Travel', 'icon': '✈️', 'color': '#6c5ce7'},
            {'name': 'Home', 'icon': '🏠', 'color': '#a29bfe'},
            {'name': 'Other', 'icon': '📝', 'color': '#b2bec3'},
        ]
        
        for cat_data in categories:
            category, created = ExpenseCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')
            else:
                self.stdout.write(f'Category already exists: {category.name}')
