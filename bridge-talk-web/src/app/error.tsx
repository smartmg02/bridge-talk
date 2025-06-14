'use client';

import * as React from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';
import TextButton from '@/components/buttons/TextButton';

const AlarmIcon = RiAlarmWarningFill as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <section className='bg-white'>
        <div className='layout flex min-h-screen flex-col items-center justify-center text-center text-black'>
          <AlarmIcon
            className='w-[60px] h-[60px] drop-shadow-glow animate-flicker text-red-500'
          />
          <h1 className='mt-8 text-4xl md:text-6xl'>Oops, something went wrong!</h1>
          <TextButton variant='basic' onClick={reset} className='mt-4'>
            Try again
          </TextButton>
        </div>
      </section>
    </main>
  );
}
