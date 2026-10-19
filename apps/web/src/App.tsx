import { Convert } from './pages/Convert.tsx'
import { Editor } from './pages/Editor.tsx'
import { Home } from './pages/Home.tsx'
import { navigate, useRoute } from './use-route.ts'

export default function App() {
  const route = useRoute()

  return (
    <div className="shell">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate('/')}>
          Smart-Read
        </button>
        <nav>
          <button type="button" className={route === '/edit' ? 'active' : undefined} onClick={() => navigate('/edit')}>
            Chỉnh sửa
          </button>
          <button
            type="button"
            className={route === '/convert' ? 'active' : undefined}
            onClick={() => navigate('/convert')}
          >
            Chuyển đổi
          </button>
        </nav>
      </header>
      {route === '/edit' ? <Editor /> : route === '/convert' ? <Convert /> : <Home />}
    </div>
  )
}
