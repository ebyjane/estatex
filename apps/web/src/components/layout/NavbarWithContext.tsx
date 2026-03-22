'use client';

import { Navbar } from './Navbar';

export function NavbarWithContext({ showAdmin = false }: { showAdmin?: boolean }) {
  return <Navbar showAdmin={showAdmin} />;
}
