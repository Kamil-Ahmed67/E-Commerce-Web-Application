import { handleSSLCommerzIPN } from "@/app/utils/sslcommerzService";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const ipnData = await request.json();
    
    const result = await handleSSLCommerzIPN(ipnData);
    
    if (result.status === 'VALID' || result.status === 'VALIDATED') {
      // Process successful payment
      // Update your database, send confirmation emails, etc.
      
      return NextResponse.json({ 
        status: 'success', 
        message: 'IPN processed successfully' 
      });
    } else if (result.status === 'HOLD') {
      // Handle held transactions (high risk)
      // Notify admin, hold order fulfillment, etc.
      
      return NextResponse.json({ 
        status: 'hold', 
        message: 'Transaction held for verification' 
      });
    } else {
      return NextResponse.json({ 
        status: 'failed', 
        message: 'Payment validation failed' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('IPN processing error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}