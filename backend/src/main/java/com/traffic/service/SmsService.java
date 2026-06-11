package com.traffic.service;

public interface SmsService {

    /**
     * Send payment confirmation SMS
     */
    void sendPaymentConfirmation(String phoneNumber, Double amount, String fineReference, String paymentId);

    /**
     * Send refund notification SMS
     */
    void sendRefundNotification(String phoneNumber, Double refundAmount, String originalPaymentId);

    /**
     * Generic SMS sending method
     */
    void sendSms(String phoneNumber, String message);
}
