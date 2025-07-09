from rest_framework import serializers
from .models import Payment

class CreatePaymentIntentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField(required=False)  # Optional for payment-first flow
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3, default='usd')
    booking_data = serializers.DictField(required=False)  # For payment-first flow

class ConfirmPaymentSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField()

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'user', 'payment_intent_id', 'amount', 'currency', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at'] 