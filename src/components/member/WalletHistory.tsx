import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, ArrowUpRight, ArrowDownLeft, Coins, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  transaction_type: string;
  amount_ran: number;
  description: string;
  created_at: string;
  reference_id?: string;
  balance_after: number;
}

interface WalletHistoryProps {
  userPhone: string;
}

export const WalletHistory = ({ userPhone }: WalletHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!userPhone) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://mrbupzghoxuzntenmazv.supabase.co/functions/v1/wallet-status?phone=${userPhone}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      } else {
        toast.error("Không thể tải lịch sử giao dịch");
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error("Lỗi khi tải lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userPhone]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
      case 'PROMO_CREDIT':
      case 'PURCHASE_CREDIT':
        return <ArrowUpRight className="h-4 w-4 text-success" />;
      case 'DEBIT':
      case 'BILL_PAYMENT':
      case 'VOUCHER_EXCHANGE':
        return <ArrowDownLeft className="h-4 w-4 text-destructive" />;
      default:
        return <Coins className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
      case 'PROMO_CREDIT':
      case 'PURCHASE_CREDIT':
        return 'text-success';
      case 'DEBIT':
      case 'BILL_PAYMENT':
      case 'VOUCHER_EXCHANGE':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'Cộng điểm';
      case 'PROMO_CREDIT':
        return 'Khuyến mãi';
      case 'PURCHASE_CREDIT':
        return 'Mua voucher';
      case 'DEBIT':
        return 'Trừ điểm';
      case 'BILL_PAYMENT':
        return 'Thanh toán bill';
      case 'VOUCHER_EXCHANGE':
        return 'Đổi voucher';
      default:
        return type;
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = ['CREDIT', 'PROMO_CREDIT', 'PURCHASE_CREDIT'].includes(type) ? '+' : '-';
    return `${sign}${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Lịch sử giao dịch
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTransactions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có giao dịch nào</p>
            <p className="text-sm">Lịch sử giao dịch sẽ hiển thị tại đây</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((transaction) => {
              const { date, time } = formatDate(transaction.created_at);
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {getTransactionTypeName(transaction.transaction_type)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.transaction_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {transaction.description || 'Không có mô tả'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{date}</span>
                      <span>•</span>
                      <span>{time}</span>
                      {transaction.reference_id && (
                        <>
                          <span>•</span>
                          <span className="font-mono">
                            {transaction.reference_id.slice(-8)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                      {formatAmount(transaction.amount_ran, transaction.transaction_type)} RAN
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Số dư: {transaction.balance_after.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};