import { createContext, useContext, useState, useEffect } from 'react'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('pharma_notifications')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('pharma_notifications', JSON.stringify(notifications))
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = ({ type = 'info', title, message }) => {
    const newNotif = {
      id: Date.now(),
      type,
      title,
      message,
      time: 'Just now',
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  const markAsRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  const clearAllNotifications = () => setNotifications([])

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
