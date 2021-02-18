import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="flex flex-col flex-none w-64 h-full border-r border-gray-100 bg-gray-50">
      <Link href="/app">
        <a className="w-full px-8 py-3 font-medium text-gray-800 hover:bg-gray-200 active:bg-gray-300">
          Atomic
        </a>
      </Link>
      <Link href="/app">
        <a className="w-full px-8 py-1 mt-2 text-gray-800 hover:bg-gray-200 active:bg-gray-300">
          Test
        </a>
      </Link>
    </div>
  );
};

export default Sidebar;
