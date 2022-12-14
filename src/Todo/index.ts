import Hapi from '@hapi/hapi';
import { Method, StatusCode } from '../enums/http';
import {
  ICreateChannelRequest,
  IGetListRequest,
  IGetTodoDetailRequest,
  IUpdateTodoPayload
} from './interfaces';
import {
  createTodoPayloadValidator,
  getListQueryValidator,
  todoIdParamValidator,
  updateTodoPayloadValidator,
  deleteTodoPayloadValidator
} from './validators';
import * as services from './services';
import {
  baseTodoResponse,
  listTodoResponse,
  getTodoDetailResponse,
  updateTodoResponse,
  baseDeleteTodoResponse
} from './__mocks__/data';
import {
  mapCreateTodoResponse,
  mapListTodoResponse,
  mapGetTodoDetailResponse,
  mapUpdateTodoResponse,
  mapDeleteTodoResponse
} from './presenter';
import logger from '../logger';
import { getAuthorizerId } from '../utils/authHelper';

const createTodo: Hapi.ServerRoute = {
  method: Method.POST,
  path: '/todo',
  options: {
    auth: 'jwt',
    description: 'Create todo',
    tags: ['api', 'todo'],
    validate: {
      payload: createTodoPayloadValidator
    },
    handler: async (
      hapiRequest: ICreateChannelRequest,
      hapiResponse: Hapi.ResponseToolkit
    ) => {
      const todo = await services.createTodo(
        hapiRequest.payload,
        getAuthorizerId(hapiRequest)
      );
      return hapiResponse
        .response(mapCreateTodoResponse(todo))
        .code(StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [StatusCode.OK]: {
            description: 'Create todo successfully',
            schema: {
              properties: {
                data: {
                  type: 'object',
                  example: baseTodoResponse
                }
              }
            }
          }
        }
      }
    }
  }
};

const getListTodo: Hapi.ServerRoute = {
  method: Method.GET,
  path: '/todo',
  options: {
    auth: 'jwt',
    description: 'Get list todo',
    tags: ['api', 'todo'],
    validate: {
      query: getListQueryValidator
    },
    handler: async (
      hapiRequest: IGetListRequest,
      hapiResponse: Hapi.ResponseToolkit
    ) => {
      const { query } = hapiRequest;
      const rows = await services.getListTodoByParameter({
        ...query
      });
      return hapiResponse
        .response(mapListTodoResponse(rows))
        .code(StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [StatusCode.OK]: {
            description: 'Get List todo successfully',
            schema: {
              properties: {
                data: {
                  type: 'object',
                  example: listTodoResponse
                }
              }
            }
          }
        }
      }
    }
  }
};

const getTodoDetail: Hapi.ServerRoute = {
  method: Method.GET,
  path: '/todo/{todoId}',
  options: {
    auth: 'jwt',
    description: 'Get Todo Detail',
    tags: ['api', 'todo'],
    validate: {
      params: todoIdParamValidator
    },
    handler: async (
      hapiRequest: IGetTodoDetailRequest,
      hapiResponse: Hapi.ResponseToolkit
    ) => {
      const {
        params: { todoId }
      } = hapiRequest;
      const todo = await services.getTodoDetailById(todoId);
      if (!todo) {
        logger.error('Todo with todoId ' + todoId + ' not found');
        return hapiResponse.response(undefined).code(StatusCode.NOT_FOUND);
      }
      return hapiResponse
        .response(mapGetTodoDetailResponse(todo))
        .code(StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [StatusCode.OK]: {
            description: 'Get Todo Detail successfully',
            schema: {
              properties: {
                data: {
                  type: 'object',
                  example: getTodoDetailResponse
                }
              }
            }
          },
          [StatusCode.NOT_FOUND]: {
            description: 'Todo with ID not found'
          }
        }
      }
    }
  }
};

const updateTodoById: Hapi.ServerRoute = {
  method: Method.PUT,
  path: '/todo/{todoId}',
  options: {
    auth: 'jwt',
    description: 'Update todo',
    tags: ['api', 'todo'],
    validate: {
      params: todoIdParamValidator,
      payload: updateTodoPayloadValidator
    },
    handler: async (
      hapiRequest: Hapi.Request,
      hapiResponse: Hapi.ResponseToolkit
    ) => {
      const {
        params: { todoId },
        payload
      }: any = hapiRequest;
      const authorizerId = await getAuthorizerId(hapiRequest);
      const todo = await services.updateTodoById(
        todoId,
        payload as IUpdateTodoPayload,
        authorizerId
      );

      return hapiResponse
        .response(mapUpdateTodoResponse(todo))
        .code(StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [StatusCode.OK]: {
            description: 'Update Todo success',
            schema: {
              properties: {
                data: {
                  type: 'object',
                  example: updateTodoResponse
                }
              }
            }
          }
        }
      }
    }
  }
};

const deleteTodo: Hapi.ServerRoute = {
  method: Method.DELETE,
  path: '/todo/{todoId}',
  options: {
    auth: 'jwt',
    description: 'Delete todo',
    tags: ['api', 'todo'],
    validate: {
      params: deleteTodoPayloadValidator
    },
    handler: async (
      hapiRequest: Hapi.Request,
      hapiResponse: Hapi.ResponseToolkit
    ) => {
      const todo = await services.deleteTodoById(hapiRequest.params.todoId);
      return hapiResponse
        .response(mapDeleteTodoResponse(todo))
        .code(StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [StatusCode.OK]: {
            description: 'Delete todo successfully',
            schema: {
              properties: {
                data: {
                  type: 'object',
                  example: baseDeleteTodoResponse
                }
              }
            }
          }
        }
      }
    }
  }
};

const todoHandlers: Hapi.ServerRoute[] = [
  createTodo,
  getListTodo,
  getTodoDetail,
  updateTodoById,
  deleteTodo
];

export default todoHandlers;
