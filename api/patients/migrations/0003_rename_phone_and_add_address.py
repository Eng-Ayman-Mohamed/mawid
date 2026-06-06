from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('patients', '0002_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='patient',
            old_name='phone_number',
            new_name='phone',
        ),
        migrations.AddField(
            model_name='patient',
            name='address',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='patient',
            name='phone',
            field=models.CharField(blank=True, max_length=15),
        ),
        migrations.AlterField(
            model_name='patient',
            name='blood_group',
            field=models.CharField(blank=True, max_length=5),
        ),
    ]
