import subprocess
import sys
import uuid
import json

# Configuración: cadena de valores separados por comas y ID del Data Store
values = "value1,value2,value3"  # Ajusta los valores según corresponda
data_store_id = '139d5ab9613007c191cc8704d780dddaa4c14686eb7f66209e51bf9f2b256f4b'  # Reemplaza con tu Data Store ID

# Función para convertir a hexadecimal
def to_hex(s):
    return s.encode('utf-8').hex()

# Generar un key aleatorio
def generate_key():
    return uuid.uuid4().hex  # Aquí se quitan los paréntesis

# Crear la lista de cambios
changelist = []

# Recorre cada valor en la cadena de valores
for value in values.split(','):
    key = generate_key()  # Generar un key aleatorio
    hex_key = to_hex(key)
    hex_value = to_hex(value)
    
    # Agrega la acción a la lista de cambios
    changelist.append({"action": "insert", "key": hex_key, "value": hex_value})

# Convertir la lista de cambios a JSON
changelist_json = json.dumps(changelist, indent=4)

# Comando CLI para insertar los datos en el Data Store
command = f"chia data update_data_store --id {data_store_id} --changelist '{changelist_json}'"

# Ejecuta el comando CLI
try:
    result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(f"Éxito: {result.stdout.decode('utf-8')}")
except subprocess.CalledProcessError as e:
    print(f"Error: {e.stderr.decode('utf-8')}", file=sys.stderr)
