# Generated by Django 4.2.7 on 2025-07-06 12:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_alter_payment_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='payment',
            name='stripe_payment_intent_id',
        ),
        migrations.AddField(
            model_name='payment',
            name='payment_intent_id',
            field=models.CharField(default=1, max_length=255, unique=True),
            preserve_default=False,
        ),
    ]
