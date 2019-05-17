import React, {Component} from 'react';
import MainComponent from "./components";
import {connect} from 'react-redux';
import {onAddToLocalStorage, counter} from "../../data/Todo/actions";
import PropTypes from "prop-types";

class Main extends Component {

  static propTypes = {
    list: PropTypes.array,
    count: PropTypes.any,
    onAddToLocalStorage: PropTypes.func,
    counter: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      text: "",
      list: []
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleAddToList = this.handleAddToList.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.doneItem = this.doneItem.bind(this);
    this.sortDone = this.sortDone.bind(this);
    this.sortResolved = this.sortResolved.bind(this);
    this.deleteResolved = this.deleteResolved.bind(this);
    this.editItem = this.editItem.bind(this);
    this.changeStateList = this.changeStateList.bind(this);
    this.counter = this.counter.bind(this);
    this.addToLocalStorage = this.addToLocalStorage.bind(this);
  }

  counter(number) {
    this.props.counter(number);
  }

  addToLocalStorage(newList) {
    this.props.onAddToLocalStorage(newList);
  }

  componentWillMount() {
    if (localStorage.getItem('todo') !== null) {
      this.setState({list: JSON.parse(localStorage.getItem('todo'))});
    }
  }

  changeStateList(newList) {
    localStorage.setItem('todo', JSON.stringify(newList));
    this.setState(() => {
      return {list: newList}
    },);
  }

  sortResolved() {
    const newItems = this.deepCopy(this.state.list);
    let newItem = [...newItems.filter(item => item.flag).sort((a, b) => ('' + a.text).localeCompare(b.text)),
      ...newItems.filter(item => !item.flag).sort((a, b) => ('' + a.text).localeCompare(b.text))];
    if (JSON.stringify(newItem) === JSON.stringify(this.state.list)) {
      return;
    }
    this.addToLocalStorage(newItems);
    this.changeStateList(newItem);
  }

  sortDone() {
    const newItems = this.deepCopy(this.state.list);
    let newItem = [...newItems.filter(item => !item.flag).sort((a, b) => ('' + a.text).localeCompare(b.text)),
      ...newItems.filter(item => item.flag).sort((a, b) => ('' + a.text).localeCompare(b.text))];
    if (JSON.stringify(newItem) === JSON.stringify(this.state.list)) {
      return;
    }
    this.addToLocalStorage(newItems);
    this.changeStateList(newItem);
  }

  static generatorUniqueId() {
    return "id" + Math.random().toString(16).slice(2);
  }

  deleteResolved() {
    const tempList = this.deepCopy(this.state.list);
    const newItems = tempList.filter(item => item.flag !== true);
    this.addToLocalStorage(newItems);
    this.changeStateList(newItems);
  }

  doneItem(id) {
    const newItems = this.deepCopy(this.state.list).reduce((acc, item) => {
      if (item.id === id) {
        item.flag = !item.flag;
      }
      acc.push(item);
      return acc;
    }, []);
    this.addToLocalStorage(newItems);
    this.changeStateList(newItems);
  }

  removeItem(id) {
    const newItem = this.state.list.filter(item => {
      if (item.id !== id) {
        return item
      }
    });
    this.addToLocalStorage(newItem);
    this.changeStateList(newItem);
  }

  editItem(id, text) {
    const isEditItem = this.state.list.map((item) => {
      if (item.id === id) {
        item.text = text;
      }
      return item;
    });
    this.addToLocalStorage(isEditItem);
    this.changeStateList(isEditItem);
  }

  handleKeyPress(text) {
    this.setState(() => {
      return {text: text}
    });
  }

  handleAddToList() {
    if (this.state.text.trim().length === 0) {
      return;
    }
    const newList = this.deepCopy(this.props.list);
    newList.push({text: this.state.text, flag: false, id: Main.generatorUniqueId()});
    document.getElementById("input").value = "";
    this.addToLocalStorage(newList);
    this.changeStateList(newList);
  }

  render() {
    return (
      <MainComponent
        onKeyPress={this.handleKeyPress}
        onAddItem={this.handleAddToList}
        text={this.state.text}
        list={this.props.list}
        onGeneratorUniqueId={Main.generatorUniqueId}
        onRemoveItem={this.removeItem}
        onDoneItem={this.doneItem}
        onSortDone={this.sortDone}
        onSortResolved={this.sortResolved}
        onDeleteResolved={this.deleteResolved}
        onEditItem={this.editItem}
      />
    )
  }

  deepCopy(cloneableData) {
    let clonedData;
    if (cloneableData instanceof Object) {
      if (Array.isArray(cloneableData)) {
        clonedData = [];
      } else {
        clonedData = {};
      }
      for (let key in cloneableData) {
        clonedData[key] = this.deepCopy(cloneableData[key]);
      }
    } else {
      clonedData = cloneableData;
    }
    return clonedData;
  }
}

const mapStateToProps = (state) => {
  return {
    list: state.Todo.list,
    count: state.Todo.count
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAddToLocalStorage: (list) => dispatch(onAddToLocalStorage(list)),
    counter: (count) => dispatch(counter(count))
  };
};

export default connect((mapStateToProps), mapDispatchToProps)(Main)


