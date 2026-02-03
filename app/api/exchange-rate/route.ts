import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data = await response.json();
    const inrRate = data.usd.inr;
    return NextResponse.json({ inrRate });
  } catch (error) { 
    return NextResponse.json({ error: 'Failed to fetch exchange rate' }, { status: 500 });
  }
}
