import { Component, ElementRef, ViewChild } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { ColorPickerModule } from 'primeng/colorpicker';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { QrStyleSelectComponent } from '../../../../../../../shared/components/qr-style-select/qr-style-select/qr-style-select.component';
import { LucideAngularModule } from 'lucide-angular';
import { ICONS } from '../../../../../../../../assets/icons/lucide.icons';
import QRCodeStyling, {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  FileExtension,
  Options,
  QRCode,
} from 'qr-code-styling';
import { ToastService } from '../../../../../../../shared/services/toast-generator.service';
import { ViewportService } from '../../../../../../../shared/services/viewport.service';

@Component({
  selector: 'app-free-generator',
  imports: [
    TextareaModule,
    ColorPickerModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    QrStyleSelectComponent,
    LucideAngularModule,
  ],
  templateUrl: './free-generator.component.html',
  styleUrl: './free-generator.component.scss',
})
export class FreeGeneratorComponent {
  constructor(
    private readonly toastGenerator: ToastService,
    private readonly screenService: ViewportService
  ) {}

  @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef;
  @ViewChild('hiddenQrContainer', { static: true }) hiddenQrContainer!: ElementRef<HTMLDivElement>;

  qrCode: QRCodeStyling | null = null;
  qrCodeToDownload: QRCodeStyling | null = null;

  sizes = [
    { label: '64x64', value: 64 },
    { label: '128x128', value: 128 },
    { label: '256x256', value: 256 },
    { label: '512x512', value: 512 },
    { label: '1024x1024', value: 1024 },
    { label: '2048x2048', value: 2048 },
  ];

  errorCorrectons = [
    { label: 'Low (7%)', value: 'L' },
    { label: 'Medium (15%)', value: 'M' },
    { label: 'Quartile (25%)', value: 'Q' },
    { label: 'High (30%)', value: 'H' },
  ];

  downloadFormats = [
    { label: 'SVG', value: 'svg' },
    { label: 'PNG', value: 'png' },
  ];

  bgColor: string | undefined = '#FFFFFF';
  color: string | undefined = '#000000';

  selectedMainStyle = '';
  selectedCornerStyle = '';

  selectedErrCorrection = this.errorCorrectons[1].value; //M;
  selectedSize = this.sizes[3].value; //512

  selectedData = '';

  qrIsGenerated = false;

  downloadFormat = this.downloadFormats[1].value;

  onDotStyleChange(event: any) {
    this.selectedMainStyle = event.value;
    this.qrCode?.update({
      dotsOptions: { type: this.selectedMainStyle as DotType },
      cornersDotOptions: { type: this.selectedMainStyle as DotType },
    });
  }

  onCornerStyleChange(event: any) {
    this.selectedCornerStyle = event.value;
    this.qrCode?.update({
      cornersSquareOptions: { type: this.selectedCornerStyle as CornerSquareType },
    });
  }

  onDownloadClick() {
    this.qrCodeToDownload = new QRCodeStyling(this._getQROptions(true));
    this.qrCodeToDownload.append(this.hiddenQrContainer.nativeElement);
    this.qrCodeToDownload?.download({
      name: 'free_scanguino_qr',
      extension: (this.downloadFormat ?? 'png') as FileExtension,
    });
  }

  onGenerateClick() {
    if (!this.selectedData || !this.selectedSize || !this.selectedErrCorrection) {
      this.toastGenerator.error('To generate QR-Code you should fill all required fields');
      return;
    }

    this._generateQR();
  }

  private _getQROptions(toDownload = false): Partial<Options> {
    const size = toDownload ? this.selectedSize : this.selectedSize > 256 ? 256 : this.selectedSize;

    return {
      width: size,
      height: size,
      type: 'svg',
      data: this.selectedData,
      // image: '/favicon.ico',
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: this.selectedErrCorrection as ErrorCorrectionLevel,
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 20,
        crossOrigin: 'anonymous',
      },
      dotsOptions: {
        color: this.color,
        type: this.selectedMainStyle as DotType,
      },
      backgroundOptions: {
        color: this.bgColor,
      },
      cornersSquareOptions: {
        color: this.color,
        type: this.selectedCornerStyle as CornerSquareType,
      },
      cornersDotOptions: {
        color: this.color,
        type: this.selectedMainStyle as CornerDotType,
      },
    };
  }

  private _generateQR() {
    const qrOptions = this._getQROptions();

    if (this.qrCode) {
      this.qrCode.update(qrOptions);
      return;
    }

    this.qrCode = new QRCodeStyling(qrOptions);
    this.qrCode.append(this.qrCanvas.nativeElement);
    this.qrIsGenerated = true;
  }

  protected readonly ICONS = ICONS;
}
