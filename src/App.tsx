import React from 'react';
import { Layout, Row, Col, Typography, Divider, List, Skeleton, Empty, Checkbox, Popconfirm, Button, message, Form, Input } from 'antd';
import { MANAGE_TASKS_API } from './api/manage-tasks';
import { TaskRequest, TaskResponse, TaskStatus } from './models/task';

const { Content } = Layout;

const contentStyle: React.CSSProperties = {
  padding: '.5rem',
  margin: '.5rem auto',
  backgroundColor: '#FFFFFF',
  width: '80%',
  maxWidth: '950px',
  userSelect: 'none'
};

function App() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [tasks, setTasks] = React.useState<TaskResponse[]>([]);
  const [form] = Form.useForm();

  const fetchTasks = async () => {
    setLoading(true);
    const { data, status } = await MANAGE_TASKS_API.get<TaskResponse[]>('/task');
    if (status === 200) {
      const tasks = data.map<TaskResponse>(task => ({
        ...task,
        created: typeof task.created === 'string' ? new Date(task.created) : task.created
      }));
      setTimeout(() => {
        setTasks(tasks);
        setTimeout(() => {
          setLoading(false);
        }, 10);
      }, 1000);
    }
  };

  const isCompleted = (status: TaskStatus) => status === TaskStatus.Completed;

  const addTask = async (action: string) => {
    const taskRequest: TaskRequest = {
      action,
      status: TaskStatus.NotCompleted
    };
    const { data, status } = await MANAGE_TASKS_API.post<TaskResponse>(`/task`, taskRequest);
    if (status === 201) {
      setTasks([
        ...tasks,
        data
      ]);
      form.setFieldValue('action', null);
      message.success('Task created successfully');
    }
  };

  const updateTask = async (
    task: TaskResponse,
    changedAction: string,
    changedStatus: TaskStatus
  ) => {
    const index = tasks.findIndex(({ taskId }) => taskId === task.taskId);
    if ((task.action === changedAction && task.status === changedStatus) || !~index) {
      return;
    }
    const taskRequest: TaskRequest = {
      action: changedAction,
      status: changedStatus
    };
    const { data, status } = await MANAGE_TASKS_API.put<TaskResponse>(`/task/${task.taskId}`, taskRequest);
    if (status === 200) {
      tasks[index] = data;
      setTasks([...tasks]);
      message.success('Task updated successfully');
    }
  };

  const deleteTask = async (taskId: string) => {
    const index = tasks.findIndex(task => task.taskId === taskId);
    if (!~index) {
      return;
    }
    const { status } = await MANAGE_TASKS_API.delete<void>(`/task/${taskId}`);
    if (status === 204) {
      tasks.splice(index, 1);
      setTasks([...tasks]);
      message.success('Task deleted successfully');
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="wrapper">
      <Row align={ 'top' }>
        <Col md={{ span: 14, order: 1 }} order={2} span={24}>
          <Content style={contentStyle}>
            {
              loading ? <Skeleton active/> :
                tasks.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
                  <>
                    <Divider orientation="left">
                      <Typography.Title level={3}>Task List</Typography.Title>
                    </Divider>
                    <List
                      size="large"
                      dataSource={tasks}
                      renderItem={(task) => (
                        <List.Item>
                          <Typography.Paragraph editable={
                            isCompleted(task.status) ? false : {
                              tooltip: 'Edit Task Action',
                              maxLength: 50,
                              text: task.action,
                              onChange: action => updateTask(task, action, task.status)
                            }
                          } style={{ width: '100%' }}>
                            <Checkbox
                              key={task.taskId}
                              checked={isCompleted(task.status)}
                              onChange={event => updateTask(
                                task,
                                task.action,
                                event.target.checked ? TaskStatus.Completed : TaskStatus.NotCompleted
                              )}
                            >
                              <Typography.Text
                                type={isCompleted(task.status) ? 'secondary' : undefined}
                                italic={isCompleted(task.status)}
                                delete={isCompleted(task.status)}
                              >{task.action}</Typography.Text>
                            </Checkbox>
                          </Typography.Paragraph>
                          <Popconfirm
                            title="Delete the task"
                            description="Are you sure to delete this task?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={_event => deleteTask(task.taskId)}
                          >
                            <Button type="primary" danger>X</Button>
                          </Popconfirm>
                        </List.Item>
                      )}
                    />
                  </>
            }
          </Content>
        </Col>
        <Col md={{ span: 10, order: 2 }} order={1} span={24}>
          <Content style={{
            ...contentStyle,
            margin: '.5rem',
            width: 'auto',
            maxWidth: '500px'
          }}>
            <Form
              name="manage-add-task"
              form={form}
              autoComplete="off"
              onFinish={({ action }) => addTask(action)}
            >
              <Form.Item
                label="Task Action"
                name="action"
                rules={[{ required: true, message: 'Please input task' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ float: 'right' }}
                >Add Task</Button>
              </Form.Item>
            </Form>
          </Content>
        </Col>
      </Row>
    </div>
  );
};

export default App;
