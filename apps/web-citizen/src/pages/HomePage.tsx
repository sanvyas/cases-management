import { Link } from '@tanstack/react-router';
import { useLang } from '../lang';
import { categories } from '../data/mockData';

export function HomePage() {
  const { language, t } = useLang();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-blue-700 px-4 py-5 text-white">
        <h1 className="text-xl font-bold">{t('app.title')}</h1>
        <p className="text-sm text-blue-200">{t('app.subtitle')}</p>
      </header>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Voice CTA */}
        <button className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-center text-white shadow-lg">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </div>
          <p className="text-lg font-semibold">{t('home.speak')}</p>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">{t('home.or')}</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Categories */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">{t('home.categories')}</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/register"
                search={{ category: cat.id }}
                className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-2 py-4 text-center shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="mt-2 text-xs font-medium text-gray-700">
                  {cat.name[language]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="sticky bottom-0 flex border-t border-gray-200 bg-white">
        <Link
          to="/home"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-blue-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Home
        </Link>
        <Link
          to="/track"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-gray-500 hover:text-blue-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
          </svg>
          {t('home.track')}
        </Link>
        <Link
          to="/register"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-gray-500 hover:text-blue-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('register.title')}
        </Link>
      </nav>
    </div>
  );
}
