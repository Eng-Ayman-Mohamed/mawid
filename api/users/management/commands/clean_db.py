from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Delete all data from all tables'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-input',
            action='store_true',
            help='Skip confirmation prompt',
        )

    def handle(self, *args, **options):
        if not options['no_input']:
            self.stdout.write(self.style.WARNING(
                'This will DELETE ALL DATA from all tables!'
            ))
            confirm = input('Are you sure? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.WARNING('Cancelled.'))
                return

        with connection.schema_editor() as schema_editor:
            for table in reversed(connection.introspection.table_names()):
                if table == 'django_migrations':
                    continue
                try:
                    with connection.cursor() as cursor:
                        cursor.execute(f'TRUNCATE TABLE "{table}" CASCADE')
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Could not truncate {table}: {e}'))

        self.stdout.write(self.style.SUCCESS('All data deleted.'))
