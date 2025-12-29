# Generated manually for adding allocation_percentage and role choices

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectassignment',
            name='allocation_percentage',
            field=models.DecimalField(
                decimal_places=2,
                default=100.00,
                help_text='Allocation percentage (0-100)',
                max_digits=5
            ),
        ),
        migrations.AlterField(
            model_name='projectassignment',
            name='role',
            field=models.CharField(
                choices=[('owner', 'Owner'), ('lead', 'Lead'), ('member', 'Member')],
                default='member',
                max_length=20
            ),
        ),
    ]

