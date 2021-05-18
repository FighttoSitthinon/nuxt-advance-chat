<template>
  <v-layout column justify-center>
    <v-flex xs12 sm8 md6>
      <div class="container">
        <div v-if="!user">
          <v-row align="center">
            <v-col v-if="user" class="text-center" cols="12" lg="12">
              <v-text-field
                v-model="user.displayName"
                label="Display name"
                required
                disabled="true"
              ></v-text-field>
            </v-col>
            <v-col v-else class="text-center" cols="12" lg="12">
              <div class="my-2">
                <v-btn small @click="login">Login</v-btn>
              </div>
            </v-col>
          </v-row>
        </div>
        <div v-else class="messaging">
          <div class="inbox_msg">
            <div class="inbox_people">
              <div class="headind_srch">
                <v-row>
                  <v-col v-if="user" align="left" justify="center" cols="9">
                    <div class="user-detail">
                      <v-avatar size="40" class="mx-2">
                        <img :src="user.photoURL" />
                      </v-avatar>
                      <div class="user-detail-group">
                        <div class="name" v-text="user.displayName"></div>
                        <div class="email" v-text="user.email"></div>
                      </div>
                    </div>
                  </v-col>
                  <v-col v-if="user" cols="3" align="right" justify="center">
                    <GroupDialog
                      v-if="users.length > 0"
                      :users="users.filter((item) => item.uid !== user.uid)"
                      @created="createFirstMessageInGroup($event)"
                    />
                  </v-col>
                </v-row>
                <v-row height="100px" no-gutters>
                  <v-col cols="12" align="center" justify="center" class="px-2">
                    <v-autocomplete
                      v-model="filtered"
                      depressed
                      :items="users.filter((item) => item.uid !== user.uid)"
                      :filter="filterUser"
                      color="dark"
                      placeholder="Start typing to Search"
                      append-icon="mdi-magnify"
                      solo
                      @change="chooseUser"
                    >
                      <template v-slot:selection="data">
                        <v-chip
                          v-bind="data.attrs"
                          :input-value="data.selected"
                          close
                          @click="data.select"
                          @click:close="remove(data.item)"
                        >
                          <v-avatar left>
                            <v-img :src="data.item.photoURL"></v-img>
                          </v-avatar>
                          {{ data.item.displayName }}
                        </v-chip>
                      </template>
                      <template v-slot:item="data">
                        <template v-if="typeof data.item !== 'object'">
                          <v-list-item-content
                            v-text="data.item"
                          ></v-list-item-content>
                        </template>
                        <template v-else>
                          <v-list-item-avatar>
                            <img :src="data.item.photoURL" />
                          </v-list-item-avatar>
                          <v-list-item-content>
                            <v-list-item-title
                              v-text="data.item.displayName"
                            ></v-list-item-title>
                            <v-list-item-subtitle
                              v-text="data.item.email"
                            ></v-list-item-subtitle>
                          </v-list-item-content>
                        </template>
                      </template>
                    </v-autocomplete>
                    <span class="input-group-addon">
                      <button type="button">
                        <i class="fa fa-search" aria-hidden="true"></i>
                      </button>
                    </span>
                  </v-col>
                </v-row>
              </div>
              <div class="inbox_chat">
                <v-row
                  v-for="group in orderedGroups"
                  :key="group.id"
                  class="chat_list px-0 mx-0"
                  @click="chooseGroup(group)"
                >
                  <v-col cols="3" class="px-6">
                    <v-avatar left>
                      <v-img
                        v-if="getGroupInfo(group).type === 0"
                        size="20"
                        :src="getGroupInfo(group).photoURL"
                      ></v-img>
                      <v-icon v-else color="primary" size="50"
                        >mdi-account-multiple</v-icon
                      >
                    </v-avatar>
                  </v-col>
                  <v-col cols="9">
                    <v-row no-gutters>
                      <v-col cols="12">{{ getGroupInfo(group).name }}</v-col>
                      <v-col cols="4" class="text-no-wrap">{{
                        group.recentMessage
                          ? group.recentMessage.messageText + '...'
                          : ''
                      }}</v-col>
                      <v-col cols="8" class="chat_date mt-1">
                        {{
                          (group.modifiedAt ? group.modifiedAt.seconds : 0)
                            | formatUnix
                        }}
                      </v-col>
                    </v-row>
                    <!-- <p>Test firebase chat</p> -->
                  </v-col>
                </v-row>
              </div>
            </div>
            <div v-if="seenMsgGroup" id="chat" class="mesgs">
              <div v-if="loading" class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </div>
              <div id="chat_msg_history" class="msg_history">
                <div v-for="(msg, i) in messages" :key="i">
                  <div v-if="msg.isNotification">
                    <p class="center">{{ msg.messageText }}</p>
                  </div>
                  <div v-else>
                    <div v-if="msg.sentBy === user.uid" class="outgoing_msg">
                      <div class="sent_msg">
                        <p>{{ msg.messageText }}</p>
                        <span class="time_date">
                          {{ msg.sentAt.seconds | formatUnix }}
                        </span>
                      </div>
                    </div>
                    <div v-else class="incoming_msg">
                      <div
                        v-if="currentGroup.users.length > 0"
                        class="incoming_msg_img"
                      >
                        <v-avatar left>
                          <v-img
                            :src="getUserGroupById(msg.sentBy).photoURL"
                          ></v-img>
                        </v-avatar>
                        <!-- <v-icon color="primary">mdi-account-circle</v-icon> -->
                      </div>
                      <div class="received_msg">
                        <div class="received_withd_msg">
                          <p>{{ msg.messageText }}</p>
                          <span class="time_date">
                            {{ msg.sentAt.seconds | formatUnix }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="type_msg">
                <v-row no-gutters>
                  <v-col cols="11">
                    <v-textarea
                      v-model="message"
                      solo
                      flat
                      depressed
                      no-resize
                      placeholder="Type a message"
                      height="80"
                      @keyup.enter="sendMessage"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="1">
                    <v-btn
                      class="mx-2 send-msg-btn"
                      fab
                      dark
                      small
                      depressed
                      color="primary"
                      @click="saveMessage"
                    >
                      <v-icon>mdi-send-outline</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import _ from 'lodash'
import GroupDialog from '~/components/GroupDialog'
import group from '~/mixins/group'
import authentication from '~/mixins/authentication'
import user from '~/mixins/user'
import message from '~/mixins/message'

export default {
  components: { GroupDialog },
  mixins: [group, authentication, user, message],
  scrollToTop: false,
  data() {
    return {
      username: null,
      message: null,
      user: null,
      users: [],
      groups: [],
      filtered: null,
      search: null,
      clientSearch: null,
      indexUser: null,
      currentGroup: null,
      dialog: false,
      loading: false,
      seenMsgGroup: false,
    }
  },
  computed: {
    orderedGroups() {
      return _.orderBy(this.groups, 'modifiedAt', 'desc')
    },
  },
  watch: {
    async user(val) {
      if (!val) return
      this.saveUserToLocalStorage(val)
      this.saveUserToStore(val)
      this.fetchUsers()
      const exist = await this.checkUserExisted(val)
      if (exist) {
        this.fetchGroupByUserID(val.uid)
        return
      }
      this.saveUser(val)
    },
    groups() {
      this.getDefaultGroup()
    },
  },
  created() {
    this.user = this.decryptUser()
  },
  methods: {
    async login() {
      this.user = await this.signInWithGoogleAuthentication()
    },
    async chooseUser(user) {
      let group = await this.filterGroup([this.user.uid, user.uid])
      if (!group) {
        group = await this.createGroup(
          [this.user.uid, user.uid],
          this.user.uid,
          'Private',
          0
        )
        if (group) {
          const sentAt = new Date()
          const message = await this.saveMessage(
            'Chat created.',
            sentAt,
            group.id,
            true
          )
          if (message) {
            await this.updateGroup({
              ...group,
              ...{
                users: null,
                modifiedAt: sentAt,
                recentMessage: { ...message, ...{ readBy: [] } },
              },
            })
          }
        }
      }
      this.chooseGroup(group)
      this.filtered = null
    },
    async createFirstMessageInGroup(group) {
      if (group) {
        const sentAt = new Date()
        const message = await this.saveMessage(
          'Chat created.',
          sentAt,
          group.id,
          true
        )
        if (message) {
          await this.updateGroup({
            ...group,
            ...{
              users: null,
              modifiedAt: sentAt,
              recentMessage: { ...message, ...{ readBy: [] } },
            },
          })
        }
        this.chooseGroup(group)
      }
    },
    async chooseGroup(group) {
      this.seenMsgGroup = true
      this.messages = []
      this.loading = true
      this.currentGroup = group
      await this.fetchUsersByGroup(this.currentGroup).then(
        (response) => (this.currentGroup.users = response)
      )
      setTimeout(async () => {
        await this.fetchMessagesByGroupId(this.currentGroup.id)
        this.loading = false
        if (this.seenMsgGroup) {
          setTimeout(() => {
            this.scrollToEnd()
          }, 200)
        }
      }, 200)
    },
    scrollToEnd() {
      const chatHistory = this.$el.querySelector('#chat_msg_history')
      chatHistory.scrollTop = chatHistory.scrollHeight
    },
    filterUser(item, queryText, itemText) {
      const textOne = item.displayName.toLowerCase()
      const textTwo = item.email.toLowerCase()
      const searchText = queryText.toLowerCase()
      return textOne.includes(searchText) || textTwo.includes(searchText)
    },
    async sendMessage() {
      const sentAt = new Date()
      const message = await this.saveMessage(
        this.message,
        sentAt,
        this.currentGroup.id,
        false
      )
      if (message) {
        this.message = null
        const group = {
          ...this.currentGroup,
          ...{
            users: null,
            modifiedAt: sentAt,
            recentMessage: { ...message, ...{ readBy: [] } },
          },
        }
        this.updateGroup(group)
        this.scrollToEnd()
      }
    },
    getDefaultGroup() {
      if (this.groups.length) {
        if (this.currentGroup) return
        this.chooseGroup(this.groups[0])
      }
    },
    getUserGroupById(userId) {
      return this.currentGroup.users.filter((user) => user.uid === userId)[0]
    },
    getUserById(userId) {
      return this.users.filter((user) => user.uid === userId)[0]
    },
    getGroupInfo(group) {
      const result = {}
      if (group.type === 0) {
        const uid = group.members.filter(
          (member) => member !== this.user.uid
        )[0]
        const receiver = this.getUserById(uid)
        result.name = receiver.displayName
        result.photoURL = receiver.photoURL
      } else {
        result.name = group.name
      }
      result.type = group.type
      return result
    },
  },
}
</script>

<style scoped>
@import '~/styles/index.css';
</style>
