"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface OrderContextType {
    selectedOrderId: string | null;
    setSelectedOrderId: (orderId: string | null) => void;
    clearSelectedOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [selectedOrderId, setSelectedOrderIdState] = useState<string | null>(null);

    const setSelectedOrderId = useCallback((orderId: string | null) => {
        setSelectedOrderIdState(orderId);
    }, []);

    const clearSelectedOrder = useCallback(() => {
        setSelectedOrderIdState(null);
    }, []);

    return (
        <OrderContext.Provider
            value={{
                selectedOrderId,
                setSelectedOrderId,
                clearSelectedOrder,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error("useOrder must be used within an OrderProvider");
    }
    return context;
}
