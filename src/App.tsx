import { useEffect, useState } from 'react'
import './App.css'

type SavedServer = {
  id: string
  address: string
  port: string
  name: string
}

function App() {
  const [address, setAddress] = useState('')
  const [port, setPort] = useState('80')
  const [serverName, setServerName] = useState('')
  const [savedServers, setSavedServers] = useState<SavedServer[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('md_lan_saved_servers')

    if (stored) {
      try {
        setSavedServers(JSON.parse(stored))
      } catch {
        localStorage.removeItem('md_lan_saved_servers')
      }
    }
  }, [])

  const showMessage = (text: string) => {
    setMessage(text)
    setError('')

    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  const showError = (text: string) => {
    setError(text)
    setMessage('')
  }

  const isValidAddress = (value: string) => {
    const trimmed = value.trim()

    // IPv4 address
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

    // Hostnames such as localhost or myserver
    const hostname =
      /^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    return ipv4.test(trimmed) || hostname.test(trimmed)
  }

  const getUrl = () => {
    const cleanAddress = address.trim()

    if (!cleanAddress) {
      showError('Please enter an IP address or hostname.')
      return null
    }

    if (!isValidAddress(cleanAddress)) {
      showError('Enter a valid IP address or hostname.')
      return null
    }

    const portNumber = Number(port)

    if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
      showError('Port must be between 1 and 65535.')
      return null
    }

    return `http://${cleanAddress}:${portNumber}`
  }

  const connectToServer = () => {
    const url = getUrl()

    if (!url) return

    showMessage(`Opening ${url}`)

    window.location.href = url
  }

  const saveServer = () => {
    if (!address.trim()) {
      showError('Enter an IP address or hostname first.')
      return
    }

    if (!isValidAddress(address)) {
      showError('Enter a valid IP address or hostname.')
      return
    }

    const portNumber = Number(port)

    if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
      showError('Port must be between 1 and 65535.')
      return
    }

    const existing = savedServers.find(
      (server) =>
        server.address.toLowerCase() === address.trim().toLowerCase() &&
        server.port === port
    )

    if (existing) {
      showError('This server is already saved.')
      return
    }

    const newServer: SavedServer = {
      id: Date.now().toString(),
      address: address.trim(),
      port,
      name: serverName.trim() || address.trim(),
    }

    const updated = [...savedServers, newServer]

    setSavedServers(updated)
    localStorage.setItem(
      'md_lan_saved_servers',
      JSON.stringify(updated)
    )

    setServerName('')
    showMessage('Server saved successfully.')
  }

  const openSavedServer = (server: SavedServer) => {
    const url = `http://${server.address}:${server.port}`

    showMessage(`Opening ${url}`)

    window.location.href = url
  }

  const deleteServer = (id: string) => {
    const updated = savedServers.filter((server) => server.id !== id)

    setSavedServers(updated)

    localStorage.setItem(
      'md_lan_saved_servers',
      JSON.stringify(updated)
    )

    showMessage('Saved server removed.')
  }

  const clearForm = () => {
    setAddress('')
    setPort('80')
    setServerName('')
    setError('')
    setMessage('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">MD</div>

          <div>
            <h1>MD LAN Scanner</h1>
            <p>Local Network Server Manager</p>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="welcome-card">
          <h2>Connect to a LAN Server</h2>

          <p>
            Enter the IP address of your computer or local server to open
            an XAMPP, PHP, or other local web project.
          </p>

          <div className="form-group">
            <label htmlFor="address">
              IP Address or Hostname
            </label>

            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Example: 192.168.1.10"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="port">Port</label>

              <input
                id="port"
                type="number"
                min="1"
                max="65535"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="80"
              />
            </div>

            <div className="form-group">
              <label htmlFor="serverName">
                Server Name
              </label>

              <input
                id="serverName"
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          {message && (
            <div className="message success">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="message error">
              ⚠ {error}
            </div>
          )}

          <div className="button-row">
            <button
              className="primary-button"
              onClick={connectToServer}
            >
              Connect
            </button>

            <button
              className="secondary-button"
              onClick={saveServer}
            >
              Save Server
            </button>

            <button
              className="clear-button"
              onClick={clearForm}
            >
              Clear
            </button>
          </div>

          <div className="example-box">
            <strong>Example</strong>

            <p>
              If your computer's LAN IP is
              <strong> 192.168.1.10 </strong>
              and XAMPP runs on port
              <strong> 80</strong>, enter:
            </p>

            <code>192.168.1.10 : 80</code>
          </div>
        </section>

        <section className="saved-section">
          <div className="section-title">
            <div>
              <h2>Saved Servers</h2>

              <p>
                Quickly reconnect to servers you use regularly.
              </p>
            </div>

            <span className="server-count">
              {savedServers.length}
            </span>
          </div>

          {savedServers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⌁</div>

              <h3>No saved servers</h3>

              <p>
                Enter a server address above and select
                <strong> Save Server </strong>
                to add it here.
              </p>
            </div>
          ) : (
            <div className="server-list">
              {savedServers.map((server) => (
                <div
                  className="server-card"
                  key={server.id}
                >
                  <div className="server-info">
                    <div className="server-icon">🌐</div>

                    <div>
                      <h3>{server.name}</h3>

                      <p>
                        {server.address}:{server.port}
                      </p>
                    </div>
                  </div>

                  <div className="server-actions">
                    <button
                      className="open-button"
                      onClick={() =>
                        openSavedServer(server)
                      }
                    >
                      Open
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteServer(server.id)
                      }
                      aria-label={`Delete ${server.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="tips-card">
          <h2>LAN Connection Tips</h2>

          <ul>
            <li>
              Make sure your phone and computer are connected
              to the same Wi-Fi network.
            </li>

            <li>
              Find your computer's IPv4 address using
              <strong> ipconfig </strong>
              on Windows.
            </li>

            <li>
              Make sure Apache/XAMPP is running on the computer.
            </li>

            <li>
              If Apache uses another port, enter that port
              instead of 80.
            </li>

            <li>
              Windows Firewall may need to allow Apache
              network connections.
            </li>
          </ul>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          MD LAN Scanner
        </p>

        <small>
          Powered by MD Medical Software Ltd.
        </small>
      </footer>
    </div>
  )
}

export default App
