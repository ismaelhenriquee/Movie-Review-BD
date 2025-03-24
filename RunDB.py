import psycopg2

# Configurações do banco de dados
DB_HOST = "localhost"
DB_NAME = "nome_do_banco" 
DB_USER = "usuario_do_banco"  
DB_PASSWORD = "senha_do_banco"  

# Função para rodar um arquivo SQL no banco de dados
def run_sql_script(cursor, script_file):
    with open(script_file, 'r', encoding='utf-8') as file:
        script = file.read()
        cursor.execute(script)
        print(f"Script {script_file} executado com sucesso.")

def main():
    try:
        # Conectar ao banco de dados PostgreSQL
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )
        print("Conexão com o banco de dados estabelecida.")

        # Criar um cursor para executar os comandos
        cursor = conn.cursor()

        # Rodar os scripts SQL
        run_sql_script(cursor, 'C:\Users\Pc1ac\Downloads\Movie-Review-BD-main\Movie-Review-BD\esquema-fisico\CONSULTAS.sql')
        run_sql_script(cursor, 'C:\Users\Pc1ac\Downloads\Movie-Review-BD-main\Movie-Review-BD\esquema-fisico\CRIACAO.sql')
        run_sql_script(cursor, 'C:\Users\Pc1ac\Downloads\Movie-Review-BD-main\Movie-Review-BD\esquema-fisico\POVOAMENTO.sql')

        # Comitar as mudanças no banco de dados
        conn.commit()
        print("Mudanças aplicadas no banco de dados.")

    except Exception as e:
        print(f"Erro ao executar os scripts: {e}")
    finally:
        # Fechar o cursor e a conexão com o banco de dados
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        print("Conexão fechada.")

if __name__ == "__main__":
    main()
