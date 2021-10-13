# Infra-estrutura para desenvolvimento

Aqui você será capaz de simular a aplicação.


# Estrutura

Lembre-se de manter seu diretório atualizado com base a necessidade da estrutura para seu funcionamento correto, ou seja, você deve clonar os projetos com seus respectivos nomes no diretório anterior ao deste projeto.
Para inicializar todos os serviços (ambiente de desenvolvimento), basta executar o comando:
``
sudo docker-compose up
``

## Database (MongoDB)

Utilizado para registro permanente dos dados.
Sob o IP **172.1.0.2** com a(s) porta(s) exposta(s): 27017

* Sua execução (individual):
``
sudo docker-compose up mongodb
``

## Node.JS (application)

Serviço em node.js ref. a nova API backend.
Sob o IP **172.1.0.3** com a(s) porta(s) exposta(s): 3000

* Sua execução (individual):
``
sudo docker-compose up application
``

* Acessando container:
``
sudo docker exec -it application bash
``

### Dependências
* MongoDB


# Chamadas

## Executar sincronia do PipeDrive para Bling

Basta alterar o ID pelo id do 
```
curl --request GET \
  --url http://127.0.0.1:3000/pipedrive/syncOrderBling/ID \
  --header 'x-api-key: DEMO'
```