import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import { withRouter } from "react-router-dom";
import "./index.css";
import reqwest from "reqwest";
import { Table, Input, Button, Space, Card, Popconfirm } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

const getRandomuserParams = params => {
  return {
    results: params.pagination.pageSize,
    page: params.pagination.current,
    ...params
  };
};

const { Meta } = Card;

class Details extends React.Component {
  state = {
    data: [],
    info: [],
    startDate: [],
    endDate: [],
    pagination: {
      current: 1,
      pageSize: 5
    },
    loading: false,
    searchText: "",
    searchedColumn: ""
  };
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => this.handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      )
  });
  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
  };

  componentDidMount() {
    const { pagination } = this.state;
    this.fetch({ pagination });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.fetch({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination,
      ...filters
    });
  };

  reload() {
    this.setState({ loading: true });
    const poop = this.props.location.state.name;
    reqwest({
      url: "https://api.youthcomputing.ca/events/" + poop,
      method: "get",
      type: "json"
    }).then(data => {
      this.setState({
        loading: false,
        data: data.attendees,
        info: data.info,
        startDate: data.info["start-date"]._seconds,
        endDate: data.info["end-date"]._seconds
      });
    });
  }

  fetch = (params = {}) => {
    this.setState({ loading: true });
    const poop = this.props.location.state.name;
    reqwest({
      url: "https://api.youthcomputing.ca/events/" + poop,
      method: "get",
      type: "json",
      data: getRandomuserParams(params)
    }).then(data => {
      this.setState({
        loading: false,
        data: data.attendees,
        info: data.info,
        startDate: data.info["start-date"]._seconds,
        endDate: data.info["end-date"]._seconds,
        pagination: {
          ...params.pagination,
          total: data.totalCount
          // 200 is mock data, you should read it from server
          // total: data.totalCount,
        }
      });
    });
  };

  toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
  }

  checkIn(id) {
    const poop = this.props.location.state;
    console.log(poop.name);
    fetch(`https://api.youthcomputing.ca/events/` + poop.name + "/checkin", {
      method: "put",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        userId: id
      })
    }).then(this.reload());
  }

  checkOut(id) {
    const poop = this.props.location.state;
    console.log(poop.name);
    fetch(`https://api.youthcomputing.ca/events/` + poop.name + "/checkout", {
      method: "put",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        userId: id
      })
    }).then(this.reload());
  }

  render() {
    var columns = [
      {
        title: "Name",
        dataIndex: "name",
        sorter: true,
        render: name => `${name}`,
        width: "20%",
        ...this.getColumnSearchProps("name")
      },
      {
        title: "Email",
        dataIndex: "email",
        ...this.getColumnSearchProps("email")
      },
      {
        title: "Checked In?",
        dataIndex: "checkedIn",
        render: checkedIn => `${checkedIn}`
      },
      {
        title: "Check In/Out",
        key: "action",
        render: (text, record) => (
          <span>
            <Button
              onClick={() => this.checkIn(record.id)}
              style={{ marginRight: 16 }}
            >
              Check In
            </Button>
            <Button
              onClick={() => this.checkOut(record.id)}
              style={{ marginRight: 16 }}
            >
              Check Out
            </Button>
          </span>
        )
      }
    ];

    const { data, pagination, loading, info, startDate, endDate } = this.state;
    const name = info.name + " " + info.year;

    return (
      <div className="row">
        <Card
          hoverable
          style={{ width: 350 }}
          cover={<img alt="example" src={info["event-logo"]} />}
        >
          <Meta
            title={name}
            description={
              "From " +
              this.toDateTime(startDate).toDateString() +
              " To " +
              this.toDateTime(endDate).toDateString() +
              " At " +
              info.location
            }
          />
          <p>{data.length} Attendees</p>
        </Card>

        <Table
          style={{ width: 1000 }}
          columns={columns}
          rowKey={record => record.id}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default withRouter(Details);
