import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BillUploadProps {
  onPointsAdded: (points: number) => void;
}

interface UploadedBill {
  id: string;
  amount: number;
  points: number;
  status: 'processing' | 'approved' | 'rejected';
  timestamp: string;
  reason?: string;
}

export const BillUpload = ({ onPointsAdded }: BillUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentBills, setRecentBills] = useState<UploadedBill[]>([
    {
      id: "HĐ8423",
      amount: 530000,
      points: 53000,
      status: 'approved',
      timestamp: '07/08/2025 - 14:52'
    },
    {
      id: "HĐ8422",
      amount: 0,
      points: 0,
      status: 'rejected',
      timestamp: '07/08/2025 - 14:30',
      reason: 'Ảnh mờ, không rõ số tiền'
    }
  ]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 5) {
      toast({
        title: "Quá nhiều file",
        description: "Vui lòng chọn tối đa 5 ảnh",
        variant: "destructive"
      });
      return;
    }
    setUploadedFiles(files);
  };

  const simulateOCRProcessing = async () => {
    setProcessing(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Simulate AI OCR processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate results
    const mockAmount = Math.floor(Math.random() * 500000) + 100000;
    const mockPoints = Math.floor(mockAmount * 0.1);
    const billId = `HĐ${Math.floor(Math.random() * 9000) + 1000}`;

    const newBill: UploadedBill = {
      id: billId,
      amount: mockAmount,
      points: mockPoints,
      status: 'approved',
      timestamp: new Date().toLocaleString('vi-VN')
    };

    setRecentBills(prev => [newBill, ...prev.slice(0, 4)]);
    onPointsAdded(mockPoints);
    setProcessing(false);
    setUploadProgress(0);
    setUploadedFiles([]);

    toast({
      title: "Tích điểm thành công!",
      description: `+${mockPoints.toLocaleString()} Ran từ hóa đơn ${billId}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary">Đang xử lý</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-success/10 text-success">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Gửi ảnh hóa đơn - Tích điểm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 text-center hover:border-primary/50 transition-colors">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                className="gap-2 w-full sm:w-auto" 
                onClick={() => document.getElementById('camera-input')?.click()}
              >
                <Camera className="h-4 w-4" />
                Chụp trực tiếp
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 w-full sm:w-auto" 
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="h-4 w-4" />
                Chọn từ máy
              </Button>
            </div>
            
            <input
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              id="file-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tối đa 5 ảnh • Định dạng JPG, PNG • Tối đa 10MB/ảnh
            </p>
          </div>
        </div>

        {/* Selected Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-medium">Ảnh đã chọn ({uploadedFiles.length}/5)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Bill ${index + 1}`}
                    className="w-full h-20 sm:h-24 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center p-1">
                    <span className="text-white text-xs text-center truncate">{file.name}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Đang xử lý AI nhận diện...</span>
                  <span className="text-sm">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
            
            <Button
              onClick={simulateOCRProcessing}
              disabled={processing}
              className="w-full"
            >
              {processing ? "Đang xử lý..." : "Gửi hóa đơn"}
            </Button>
          </div>
        )}

        {/* Recent Bills */}
        <div className="space-y-3">
          <h4 className="text-sm sm:text-base font-medium">Lịch sử gần đây</h4>
          <div className="space-y-2 sm:space-y-3">
            {recentBills.map((bill) => (
              <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg gap-2 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  {getStatusIcon(bill.status)}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-sm sm:text-base font-medium">Bill: {bill.id}</span>
                      {getStatusBadge(bill.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{bill.timestamp}</p>
                    {bill.reason && (
                      <p className="text-xs sm:text-sm text-destructive">Lý do: {bill.reason}</p>
                    )}
                  </div>
                </div>
                <div className="text-right sm:text-right flex-shrink-0">
                  {bill.status === 'approved' && (
                    <>
                      <p className="text-sm sm:text-base font-medium">{bill.amount.toLocaleString()} VNĐ</p>
                      <p className="text-xs sm:text-sm text-success">+{bill.points.toLocaleString()} Ran</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};