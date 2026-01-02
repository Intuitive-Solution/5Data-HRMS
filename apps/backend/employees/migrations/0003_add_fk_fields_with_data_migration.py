# Custom migration to convert department/location from CharField to ForeignKey
# This migration:
# 1. Renames old CharField fields to department_name and location_name
# 2. Adds new ForeignKey fields for department and location
# 3. Migrates data by matching names to existing Department/Location records
# 4. Removes the old CharField fields
# 5. Removes the old index on department

from django.db import migrations, models
import django.db.models.deletion


def migrate_department_location_data(apps, schema_editor):
    """
    Migrate data from old CharField fields to new ForeignKey fields.
    Matches by name and sets to NULL if no match found.
    """
    Employee = apps.get_model('employees', 'Employee')
    Department = apps.get_model('settings', 'Department')
    Location = apps.get_model('settings', 'Location')
    
    # Build lookup dictionaries for efficiency
    dept_lookup = {dept.name.lower(): dept for dept in Department.objects.all()}
    loc_lookup = {loc.name.lower(): loc for loc in Location.objects.all()}
    
    for employee in Employee.objects.all():
        # Match department by name (case-insensitive)
        if employee.department_name:
            dept = dept_lookup.get(employee.department_name.lower())
            if dept:
                employee.department = dept
        
        # Match location by name (case-insensitive)
        if employee.location_name:
            loc = loc_lookup.get(employee.location_name.lower())
            if loc:
                employee.location = loc
        
        employee.save()


def reverse_migrate_department_location_data(apps, schema_editor):
    """
    Reverse migration: copy FK data back to CharField fields.
    """
    Employee = apps.get_model('employees', 'Employee')
    
    for employee in Employee.objects.all():
        if employee.department:
            employee.department_name = employee.department.name
        if employee.location:
            employee.location_name = employee.location.name
        employee.save()


class Migration(migrations.Migration):

    dependencies = [
        ("settings", "0002_department_code_department_status_location_code_and_more"),
        ("employees", "0002_employeedocument_remove_employee_job_role_and_more"),
    ]

    operations = [
        # Step 1: Remove the old index on department (CharField)
        migrations.RemoveIndex(
            model_name="employee",
            name="employees_e_departm_e28f46_idx",
        ),
        
        # Step 2: Rename old CharField fields to *_name
        migrations.RenameField(
            model_name='employee',
            old_name='department',
            new_name='department_name',
        ),
        migrations.RenameField(
            model_name='employee',
            old_name='location',
            new_name='location_name',
        ),
        
        # Step 3: Add new ForeignKey fields
        migrations.AddField(
            model_name='employee',
            name='department',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='employees',
                to='settings.department',
            ),
        ),
        migrations.AddField(
            model_name='employee',
            name='location',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='employees',
                to='settings.location',
            ),
        ),
        
        # Step 4: Run data migration
        migrations.RunPython(
            migrate_department_location_data,
            reverse_migrate_department_location_data,
        ),
        
        # Step 5: Remove old CharField fields
        migrations.RemoveField(
            model_name='employee',
            name='department_name',
        ),
        migrations.RemoveField(
            model_name='employee',
            name='location_name',
        ),
    ]

