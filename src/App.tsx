import React from 'react';
import { Layout, Checkbox, List, Divider, Typography, Row, Col, Skeleton } from 'antd';
import { MANAGE_TASKS_API } from './api/manage-tasks';
import { TaskRequest, TaskResponse, TaskStatus } from './models/task';

const { Content } = Layout;

const contentStyle: React.CSSProperties = {
  padding: '.5rem',
  margin: '.5rem auto',
  backgroundColor: '#FFFFFF',
  width: '75%',
  maxWidth: '950px'
};

function App() {
  const [tasks, setTasks] = React.useState<TaskResponse[]>([]);

  const fetchTasks = async () => {
    const { data } = await MANAGE_TASKS_API.get<TaskResponse[]>('/task');
    const tasks = data.map<TaskResponse>(task => ({
      ...task,
      created: typeof task.created === 'string' ? new Date(task.created) : task.created
    }));
    setTimeout(() => {
      setTasks(tasks);
    }, 1000);
  };

  const isCompleted = (status: TaskStatus) => status === TaskStatus.Completed;

  const actionChange = async (task: TaskResponse, changedAction: string) => {
    const index = tasks.findIndex(({ taskId }) => taskId === task.taskId);
    if (task.action === changedAction || !~index) {
      return;
    }
    const taskRequest: TaskRequest = {
      action: changedAction,
      status: task.status
    };
    const { data } = await MANAGE_TASKS_API.put<TaskResponse>(`/task/${task.taskId}`, taskRequest);
    tasks[index] = data;
    setTasks([...tasks]);
  };

  React.useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="wrapper">
      <Row align="middle" style={{ height: '100%' }}>
        <Col span={24}>
          <Content style={contentStyle}>
            {
              tasks.length > 0 ?
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
                            onChange: action => actionChange(task, action)
                          }
                        } style={{ width: '100%' }}>
                          <Checkbox
                            key={task.taskId}
                            checked={isCompleted(task.status)}
                          >{task.action}</Checkbox>
                        </Typography.Paragraph>
                      </List.Item>
                    )}
                  />
                </> : <Skeleton active />
            }
          </Content>
        </Col>
      </Row>
    </div>
  );
};

export default App;
