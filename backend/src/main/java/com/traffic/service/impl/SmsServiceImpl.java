package com.traffic.service.impl;

import com.traffic.service.SmsService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.Account;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsServiceImpl implements SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    @Override
    public void sendPaymentConfirmation(String phoneNumber, Double amount, String fineReference, String paymentId) {
        String message = String.format(
            "Payment Confirmation: LKR %.2f has been paid for traffic fine %s. Transaction ID: %s. If you did not authorize this payment, contact support immediately.",
            amount, fineReference, paymentId
        );
        sendSms(phoneNumber, message);
    }

    @Override
    public void sendRefundNotification(String phoneNumber, Double refundAmount, String originalPaymentId) {
        String message = String.format(
            "Refund Notification: A refund of LKR %.2f has been processed for transaction %s. The amount will be credited within 3-5 business days.",
            refundAmount, originalPaymentId
        );
        sendSms(phoneNumber, message);
    }

    @Override
    public void sendSms(String phoneNumber, String message) {
        try {
            Twilio.init(accountSid, authToken);

            Message smsMessage = Message.creator(
                new PhoneNumber(twilioPhoneNumber),     // From number (Twilio)
                new PhoneNumber(phoneNumber),           // To number (user)
                message                                 // Message body
            )
            .create();

            log.info("SMS sent successfully to {} with SID: {}", phoneNumber, smsMessage.getSid());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage(), e);
            // Don't throw exception - payment should not fail if SMS fails
        }
    }
}
