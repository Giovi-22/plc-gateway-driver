# Informe de Corrección: Driver Siemens S7 (Multi-DB Architecture)

## 1. Arquitectura de Datos
Se ha implementado una separación clara entre lectura de estado y escritura de comandos en diferentes bloques de datos (DB):
- **DB1 (DB_MOTORS):** Contiene el estado de los motores (`UDT_MOTOR`). Lectura cíclica.
- **DB2 (DB_SISTEMA):** Señales globales de sistema (ej: Parada de Emergencia Global en `DBX0.0`).
- **DB3 (DB_COMMANDS):** Destino de todas las escrituras de comandos SCADA (`UDT_REMOTE_CMD`). Los comandos están compactados secuencialmente cada 6 bytes.

## 2. Cambios Técnicos Realizados

### A. Refactorización de Entidades
- **`SignalTemplate`**: Se añadió el flag `isCommand` para dirigir señales específicas al DB3.
- **`Device`**: Ahora soporta `db` (lectura) y `commandDb` (escritura) con sus respectivos offsets independientes.
- **`Motor`**: Combina las señales de `UDT_MOTOR` y `UDT_REMOTE_CMD` en un único dispositivo lógico.

### B. Corrección de Direccionamiento en `S7Driver.ts`
- Se arregló el método `transformAddress` para manejar bits correctamente (ej: `DB2.DBX0.0` -> `DB2,X0.0`).
- Se eliminaron los sufijos `.0` de los tipos `INT` y `REAL`, evitando errores de "Zero length arrays" en `nodes7`.

## 3. Configuración (`devices.json`)
Ejemplo de configuración para sincronizar:
```json
{ 
  "id": "TQ_106", 
  "db": 1, "offset": 0,         // Lectura (Status)
  "commandDb": 3, "commandOffset": 0 // Escritura (Comandos cada 6 bytes)
}
```

## 4. Verificación
El sistema fue probado con éxito en el PLC físico `10.80.90.115`, confirmando que los estados se leen del DB1 y los comandos se ejecutan correctamente sobre el DB3.
