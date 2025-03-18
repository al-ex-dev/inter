1. **agregar**  
   - **Uso:**  
     ```
     agregar <nombre de grupo> <números separados por coma>
     ```  
   - **Ejemplo:**  
     ```
     agregar stm +57 333 456 2345, +51 968 374 620
     ```  
   - **Función:** Agrega números (formateados) a la base de datos del grupo especificado.

2. **enviar**  
   - **Uso:**  
     - Enviar a todos:
       ```
       enviar
       ```  
     - Enviar solo a un grupo:
       ```
       enviar <nombre de grupo>
       ```  
   - **Ejemplo:**  
     ```
     enviar stm
     ```  
   - **Función:** Envía un mensaje con botones ("¿Recibirá el paquete?") a todos los números o a los de un grupo en particular.

3. **clear**  
   - **Opciones:**  
     - **Respuestas:**  
       ```
       clear respuestas
       ```  
       (Alias: `clear response` o `clear -r`)  
       Reinicia las respuestas recibidas.
     - **Grupo específico:**  
       ```
       clear <nombre de grupo>
       ```  
       Ejemplo:  
       ```
       clear stm
       ```  
       Elimina los números del grupo indicado.
     - **Todos los datos:**  
       ```
       clear all
       ```  
       (Alias: `clear -a`)  
       Elimina tanto los números como las respuestas.
