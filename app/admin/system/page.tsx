'use client'

import { motion } from 'framer-motion'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import {
  Database,
  Server,
  Shield,
  Activity,
  HardDrive,
  Cpu,
  Globe,
  Lock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  max?: number
}

interface SystemService {
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: string
  lastChecked: Date
  responseTime: number
}

export default function SystemPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [services, setServices] = useState<SystemService[]>([])
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    if (user?.email === 'ismaelmvula@gmail.com') {
      fetchSystemData()
      const interval = setInterval(fetchSystemData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchSystemData = async () => {
    try {
      // Mock system metrics
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: 45,
          unit: '%',
          status: 'healthy',
          max: 100
        },
        {
          name: 'Memory Usage',
          value: 2.8,
          unit: 'GB',
          status: 'healthy',
          max: 4
        },
        {
          name: 'Disk Usage',
          value: 35,
          unit: 'GB',
          status: 'healthy',
          max: 100
        },
        {
          name: 'Network I/O',
          value: 125,
          unit: 'MB/s',
          status: 'healthy'
        },
        {
          name: 'Database Connections',
          value: 23,
          unit: 'active',
          status: 'healthy',
          max: 100
        },
        {
          name: 'API Requests',
          value: 1250,
          unit: '/min',
          status: 'healthy'
        }
      ]

      const mockServices: SystemService[] = [
        {
          name: 'API Server',
          status: 'operational',
          uptime: '99.99%',
          lastChecked: new Date(),
          responseTime: 45
        },
        {
          name: 'Database',
          status: 'operational',
          uptime: '99.95%',
          lastChecked: new Date(),
          responseTime: 12
        },
        {
          name: 'Authentication Service',
          status: 'operational',
          uptime: '100%',
          lastChecked: new Date(),
          responseTime: 23
        },
        {
          name: 'AI Coach Service',
          status: 'operational',
          uptime: '99.90%',
          lastChecked: new Date(),
          responseTime: 150
        },
        {
          name: 'Payment Gateway',
          status: 'operational',
          uptime: '100%',
          lastChecked: new Date(),
          responseTime: 89
        },
        {
          name: 'Email Service',
          status: 'operational',
          uptime: '99.98%',
          lastChecked: new Date(),
          responseTime: 34
        }
      ]

      const mockLogs = [
        {
          id: 1,
          type: 'info',
          message: 'System backup completed successfully',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 2,
          type: 'warning',
          message: 'High memory usage detected (85%)',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
        },
        {
          id: 3,
          type: 'info',
          message: 'SSL certificate renewed',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: 4,
          type: 'error',
          message: 'Failed login attempt from IP 192.168.1.1',
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000)
        }
      ]

      setMetrics(mockMetrics)
      setServices(mockServices)
      setLogs(mockLogs)
    } catch (error) {
      console.error('Error fetching system data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-500'
      case 'warning':
      case 'degraded':
        return 'text-yellow-500'
      case 'critical':
      case 'down':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'critical':
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  if (user?.email !== 'ismaelmvula@gmail.com') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Admin Access Required</CardTitle>
            <CardDescription>
              This page is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const overallHealth = services.every(s => s.status === 'operational') ? 'healthy' : 
                       services.some(s => s.status === 'down') ? 'critical' : 'warning'

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
            <p className="text-gray-600 mt-2">
              Monitor system performance and service status
            </p>
          </div>

          {/* Overall Status */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(overallHealth)}
                  <div>
                    <h3 className="text-lg font-semibold">System Status</h3>
                    <p className={`text-sm ${getStatusColor(overallHealth)}`}>
                      {overallHealth === 'healthy' ? 'All Systems Operational' :
                       overallHealth === 'warning' ? 'Degraded Performance' :
                       'Critical Issues Detected'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSystemData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600">{metric.name}</h4>
                    <Badge variant={
                      metric.status === 'healthy' ? 'default' :
                      metric.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-sm text-gray-500">{metric.unit}</span>
                    </div>
                    {metric.max && (
                      <Progress 
                        value={(metric.value / metric.max) * 100} 
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Services Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Real-time monitoring of all services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          Response time: {service.responseTime}ms
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{service.uptime} uptime</p>
                      <p className="text-xs text-gray-500">
                        Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Logs */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>Recent system events and alerts</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2 hover:bg-white rounded">
                    {log.type === 'error' ? (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    ) : log.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{log.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}