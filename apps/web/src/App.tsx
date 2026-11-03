import { lazy, Suspense } from 'react'
import { Home } from './pages/Home.tsx'
import { navigate, useRoute } from './use-route.ts'

const Editor = lazy(async () => {
  const mod = await import('./pages/Editor.tsx')
  return { default: mod.Editor }
})

const Convert = lazy(async () => {
  const mod = await import('./pages/Convert.tsx')
  return { default: mod.Convert }
})

export default function App() {
  const route = useRoute()

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Bỏ qua tới nội dung
      </a>
      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate('/')}>
          Smart-Read
        </button>
        <nav aria-label="Chính">
          <button
            type="button"
            className={route === '/edit' ? 'active' : undefined}
            aria-current={route === '/edit' ? 'page' : undefined}
            onClick={() => navigate('/edit')}
          >
            Chỉnh sửa
          </button>
          <button
            type="button"
            className={route === '/convert' ? 'active' : undefined}
            aria-current={route === '/convert' ? 'page' : undefined}
            onClick={() => navigate('/convert')}
          >
            Chuyển đổi
          </button>
        </nav>
      </header>
      <Suspense fallback={<p className="empty">Đang tải…</p>}>
        {route === '/edit' ? <Editor /> : route === '/convert' ? <Convert /> : <Home />}
      </Suspense>
    </div>
  )
}
