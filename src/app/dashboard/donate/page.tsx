import { redirect } from 'next/navigation';

/** Legacy membership links now use the dedicated membership page. */
export default function DonatePage() {
  redirect('/dashboard/membership');
}
