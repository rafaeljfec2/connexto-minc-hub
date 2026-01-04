import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { useCameraPermissions } from 'expo-camera'

interface UseCameraPermissionReturn {
  permission: ReturnType<typeof useCameraPermissions>[0]
  requestPermission: ReturnType<typeof useCameraPermissions>[1]
  showPermissionDeniedAlert: (onClose?: () => void) => void
}

export function useCameraPermission(onClose?: () => void): UseCameraPermissionReturn {
  const [permission, requestPermission] = useCameraPermissions()
  const [hasShownAlert, setHasShownAlert] = useState(false)

  useEffect(() => {
    if (
      permission &&
      !permission.granted &&
      !permission.canAskAgain &&
      !hasShownAlert &&
      onClose
    ) {
      showPermissionDeniedAlert(onClose)
      setHasShownAlert(true)
    }
  }, [permission, hasShownAlert, onClose])

  const showPermissionDeniedAlert = (onCloseCallback?: () => void) => {
    Alert.alert(
      'Permissão necessária',
      'É necessário permitir o acesso à câmera para escanear QR codes.',
      [{ text: 'OK', onPress: onCloseCallback }]
    )
  }

  return {
    permission,
    requestPermission,
    showPermissionDeniedAlert,
  }
}
