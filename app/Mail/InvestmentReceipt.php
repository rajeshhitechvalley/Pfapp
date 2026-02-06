<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class InvestmentReceipt extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $investment;
    public $receiptPath;

    /**
     * Create a new message instance.
     */
    public function __construct($investment, $receiptPath = null)
    {
        $this->investment = $investment;
        $this->receiptPath = $receiptPath;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Investment Receipt - ' . $this->investment->investment_id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.investment-receipt',
            with: [
                'investment' => $this->investment,
                'user' => $this->investment->user,
                'property' => $this->investment->property,
                'plot' => $this->investment->plot,
                'plotHoldings' => $this->investment->plotHoldings,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];

        if ($this->receiptPath && \Storage::exists($this->receiptPath)) {
            $attachments[] = Attachment::fromStorage($this->receiptPath, 'investment-receipt.pdf');
        }

        return $attachments;
    }
}
