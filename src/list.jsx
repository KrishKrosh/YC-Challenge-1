import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";
import "../App.css";
import { Link } from "react-router-dom";

class Example extends React.Component {
  state = {
    isLoading: true,
    events: [],
    error: null
  };
  render() {
    const { isLoading, events, error } = this.state;
    return (
      <div className="homepage">
        <h3>YouthComputing Events</h3>

        <ListGroup>
          {error ? <p>{error.message}</p> : null}
          {!isLoading ? (
            events.events.map(event => {
              const { label, name } = event;
              return (
                <div
                  onClick={() => {
                    this.props.history.push("/details", { name: name });
                  }}
                >
                  <ListGroupItem tag="button" key={event.name} action>
                    {label}
                  </ListGroupItem>
                </div>
              );
            })
          ) : (
            // If there is a delay in data, lets let the user know it's loading
            <p>Loading...</p>
          )}
        </ListGroup>
      </div>
    );
  }

  fetchUsers() {
    // Where we're fetching data from
    fetch(`https://api.youthcomputing.ca/events`)
      // We get the API response and receive data in JSON format...
      .then(response => response.json())
      // ...then we update the users state
      .then(data =>
        this.setState({
          events: data,
          isLoading: false
        })
      )
      // Catch any errors we hit and update the app
      .catch(error => this.setState({ error, isLoading: false }));
  }
  componentDidMount() {
    this.fetchUsers();
  }
}

export default Example;
