from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('doctors', '0002_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='doctor',
            old_name='phone',
            new_name='contact',
        ),
        migrations.AddField(
            model_name='specialty',
            name='description',
            field=models.TextField(blank=True),
        ),
    ]
