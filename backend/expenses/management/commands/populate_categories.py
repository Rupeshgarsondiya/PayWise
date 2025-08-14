from django.core.management.base import BaseCommand
from expenses.models import ExpenseCategory

class Command(BaseCommand):
    help = 'Populate database with default expense categories'

    def handle(self, *args, **options):
        categories = [
            {'name': 'Food', 'icon': '🍕', 'color': '#FF6B6B'},
            {'name': 'Entertainment', 'icon': '🎬', 'color': '#4ECDC4'},
            {'name': 'Transport', 'icon': '🚗', 'color': '#45B7D1'},
            {'name': 'Shopping', 'icon': '🛍️', 'color': '#96CEB4'},
            {'name': 'Bills', 'icon': '📄', 'color': '#FFEAA7'},
            {'name': 'Healthcare', 'icon': '🏥', 'color': '#DDA0DD'},
            {'name': 'Education', 'icon': '📚', 'color': '#98D8C8'},
            {'name': 'Travel', 'icon': '✈️', 'color': '#F7DC6F'},
            {'name': 'Home', 'icon': '🏠', 'color': '#BB8FCE'},
            {'name': 'Other', 'icon': '📝', 'color': '#667eea'},
        ]

        created_count = 0
        updated_count = 0

        for category_data in categories:
            category, created = ExpenseCategory.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'icon': category_data['icon'],
                    'color': category_data['color']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )
            else:
                # Update existing category with new icon/color if different
                if (category.icon != category_data['icon'] or 
                    category.color != category_data['color']):
                    category.icon = category_data['icon']
                    category.color = category_data['color']
                    category.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'Updated category: {category.name}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed categories. '
                f'Created: {created_count}, Updated: {updated_count}'
            )
        )
