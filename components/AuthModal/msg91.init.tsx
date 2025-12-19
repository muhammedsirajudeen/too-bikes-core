'use client';

import Script from 'next/script';

// Type definitions for MSG91 SDK
interface MSG91SuccessData {
    message: string;
    type?: string;
}

interface MSG91ErrorData {
    message?: string;
    type?: string;
}

interface MSG91Configuration {
    widgetId: string;
    tokenAuth: string;
    exposeMethods: boolean;
    success: (data: MSG91SuccessData) => void;
    failure: (error: MSG91ErrorData) => void;
}

declare global {
    interface Window {
        configuration: MSG91Configuration;
        initSendOTP: (config: MSG91Configuration) => void;
    }
}

export default function Msg91Otp() {
    return (
        <>
            <Script
                src="https://verify.msg91.com/otp-provider.js"
                strategy="afterInteractive"
                onLoad={() => {
                    window.configuration = {
                        widgetId: '356c736e7070323635323039',
                        tokenAuth: '483758TYptSzsgH69455debP1',
                        exposeMethods: true,
                        success: (data) => {
                            console.log('OTP success', data);
                        },
                        failure: (error) => {
                            console.error('OTP failure', error);
                        },
                    };

                    window.initSendOTP(window.configuration);
                }}
            />
        </>
    );
}
