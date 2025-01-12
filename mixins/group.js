import firebase from '~/plugins/firebase.js'
const db = firebase.firestore()
export default {
  data() {
    return {
      groups: [],
      currentGroup: undefined,
    }
  },
  methods: {
    createGroup(userArray, createdBy, name, type) {
      const vm = this
      const members = {}
      userArray.forEach((mem) => {
        members[mem] = true
      })
      const group = {
        createdAt: new Date(),
        createdBy,
        members,
        name,
        type,
      }
      return new Promise((resolve, reject) => {
        db.collection('group')
          .add(group)
          .then(function (docRef) {
            group.id = docRef.id
            vm.fetchGroupByUserID(vm.user.uid)
            resolve(group)
          })
          .catch(function (error) {
            reject(error)
          })
      })
    },
    filterGroup(userArray) {
      return new Promise((resolve, reject) => {
        let groupRef = db.collection('group')
        userArray.forEach((mem) => {
          groupRef = groupRef.where(`members.${mem}`, '==', true)
        })
        groupRef
          .get()
          .then(function (querySnapshot) {
            const allGroups = []
            querySnapshot.forEach((doc) => {
              console.log(doc)
              const data = doc.data()
              data.id = doc.id
              allGroups.push(data)
            })
            if (allGroups.length > 0) {
              resolve(allGroups[0])
            } else {
              resolve(null)
            }
          })
          .catch(function (error) {
            reject(error)
          })
      })
    },
    fetchGroupByUserID(uid) {
      const vm = this
      return new Promise((resolve, reject) => {
        const groupRef = db.collection('group')
        groupRef
          .where(`members.${uid}`, '==', true)
          .onSnapshot((querySnapshot) => {
            const allGroups = []
            querySnapshot.forEach((doc) => {
              const data = doc.data()
              data.id = doc.id
              allGroups.push(data)
            })
            vm.groups = allGroups
          })
      })
    },
    fetchGroupByIds(groupIds) {
      const groups = []
      const groupRef = db.collection('group')
      groupIds.forEach(async (groupId) => {
        await groupRef
          .doc(groupId)
          .get()
          .then(function (doc) {
            groups.push(doc.data())
          })
          .catch(function (error) {
            // eslint-disable-next-line no-console
            console.error('Error get document: ', error)
          })
      })
      this.groups = groups
    },
    updateGroup(group) {
      db.collection('group')
        .doc(group.id)
        .set(group)
        .then(function (docRef) {})
        .catch(function (error) {
          // eslint-disable-next-line no-console
          console.error('Error writing document: ', error)
        })
    },
  },
}
