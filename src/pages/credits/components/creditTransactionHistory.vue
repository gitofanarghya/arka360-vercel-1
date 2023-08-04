<template>
	<section :class="['right_section', isCrmUser() ? 'right_sectionCRM': '']">
		<div class="container">
			<div class="content_section">
				<div class="filter_section">
					<div class="title">Credits</div>
				</div>
				<div class="cards_container" style="">
					<div class="credit_transaction">
						<div class="sub_title">Transaction History</div>
						<div class="favorite_section" v-loading="isLoadingData">
							<el-tabs v-model="activeTab" v-if="userIsAdmin">
								<el-tab-pane
									:label="tab.label"
									:name="tab.label"
									v-for="(tab, index) in tabs"
									:key="'tab' + index"
								>
								</el-tab-pane>
							</el-tabs>
							<div class="paginated-table">
								<table style="width: 100%">
									<thead class="headerSticky">
										<tr>
											<th>
												<div class="data_head">
													<span class="title_text">Date & Time</span>
												</div>
											</th>
											<th>
												<div class="data_head">
													<span class="title_text">Description</span>
												</div>
											</th>
											<th>
												<div class="data_head">
													<span class="title_text">Debited</span>
												</div>
											</th>
											<th>
												<div class="data_head">
													<span class="title_text">Credited</span>
												</div>
											</th>
											<th>
												<div class="data_head">
													<span class="title_text">Type</span>
												</div>
											</th>
											<th>
												<div class="data_head">
													<span class="title_text">User</span>
												</div>
											</th>
											<th>
												<div class="data_head">
													<span class="title_text">Status</span>
												</div>
											</th>
										</tr>
									</thead>
									<tbody id="pc_view">
										<tr v-for="entry in activeTabData" :key="entry.id">
											<td style="white-space: nowrap;">
												{{parseDate(entry.created_at)}}<br />
												<span class="transaction-time">{{parseTime(entry.created_at)}}</span>
											</td>
											<td>{{entry.order_description.description}}<br/>
												<span class="viewDetails" @click="viewTransactionDetails(entry)">View Details</span>
											</td>
											<td>{{creditText(entry.credits_spent)}}</td>
											<td>{{creditText(entry.credits_purchased)}}</td>
											<td>{{creditTypeText(entry.credit_type)}}</td>
											<td>{{entry.user}}</td>
											<td>
												<img
													:src="entry.status == 'successful' ? checkCircleFillGlyph : crossCreditsGlyph"
												/>
											</td>
										</tr>
									</tbody>

									<tbody id="mobile_view">
										<tr  v-for="entry in activeTabData" :key="entry.id">
											<td><div class="title_text">Date & Time</div><div>{{parseDate(entry.created_at)}}<br />
												<span class="transaction-time">{{parseTime(entry.created_at)}}</span></div></td>
											<td><div class="title_text">Description</div><div>{{entry.description}}<br/>
												<span class="viewDetails"  @click="isViewDetailsPopupVisible = true">View Details</span></div></td>
											<td><div class="title_text">Debited</div><div>{{entry.credits_spent.toFixed(2)}} Credits</div></td>
											<td><div class="title_text">Credited</div><div>{{entry.credits_purchased.toFixed(2)}} Credits</div></td>
											<td><div class="title_text">Type</div><div>{{creditTypeText(entry.credit_type)}}</div></td>
											<td><div class="title_text">User</div><div>{{entry.user}}</div></td>
											<td>
												<div class="title_text">Status</div>
												<div>
													<img
														class="statusIcon"
														:src="entry.status == 'successful' ? checkCircleFillGlyph : crossCreditsGlyph"
													/>
												</div>
											</td>
										</tr>
									</tbody>
								</table>
								<div
									v-infinite-scroll="loadMoreDataNew"
									infinite-scroll-disabled="busy"
									infinite-scroll-distance="10"
									style="text-align: center">
									<i v-if="paginationData[activeTab].busy" class="el-icon-loading infiniteScrollLoader"/>
								</div>
							</div>
						</div>
					</div>
					<div class="credit_balance">
						<div class="sub_title">Credit Balance</div>
						<div class="credit-balance-container">
							<div class="purchased">
								<p>Purchased Credit Balance</p>
								<div>
									<div class="title">{{formatNumberWithCommas(credits.purchased_credits)}}</div>
									<!-- <p>Last transaction on {{parseDate(creditData[creditData.length-1].created_at)}}</p> -->
									<p style="margin-top: 12px">Last transaction: {{lastTransactionDate}}</p>
								</div>
								<div>
									<el-button type="primary" class="add_credit_btn" size="default" @click="isAddCreditPopupVisible = true">Add More Credits</el-button>
								</div>
							</div>
							<div class="promotional">
								<p>Promotional Credit Balance</p>
								<div class="title">{{formatNumberWithCommas(credits.promotional_credits)}}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<add-credit-popup
			v-if="isAddCreditPopupVisible"
			@update-history-table="fetchData"
      		:isAddCreditPopupVisible.sync="isAddCreditPopupVisible" />
		<ViewDetailsPopup
          v-if="isViewDetailsPopupVisible"
		  :transactionDetails="curTransactionDetails"
          :isViewDetailsPopupVisible.sync="isViewDetailsPopupVisible"
        />
	</section>
</template>

<script>
import Vue from "vue";
import API from "@/services/api/"
import { isAdmin, formatNumberWithCommas, paginationHelper } from "@/utils.js"
import { mapState } from "pinia";
import { useCreditsStore } from "../../../stores/credits";
import infiniteScroll from 'vue-infinite-scroll'
import ViewDetailsPopup from "./ViewDetailsPopup.vue";
import checkCircleFillGlyph from '../../../assets/drop/check-circle-fill.png'
import crossCreditsGlyph from '../../../assets/drop/crossCredits.png'
import { isCrmUser } from "../../../utils";


Vue.use(infiniteScroll)

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default {
	components: {
		ViewDetailsPopup,
	},
	data() {
		return {
			isViewDetailsPopupVisible : false,
			activeTab: "All",
			tabs: [
				{ label: "All", value: 'all' },
				{ label: "My Transactions", value: 'my_transactions' },
			],
			allCreditData: [],
			userCreditData: [],
			paginationData: {
				"All": {
      				copyUrl: "",
		      		nextUrl: null,
					busy: false,
				},
				"My Transactions": {
      				copyUrl: "",
		      		nextUrl: null,
					busy: false,
				}
			},

			isAddCreditPopupVisible: false,
			busy: false,
			isLoadingData: false,
			userIsAdmin: isAdmin(),
			curTransactionDetails: {},
			checkCircleFillGlyph,
			crossCreditsGlyph,
		}
	},

	computed: {
		...mapState(useCreditsStore, {
            credits: 'GET_CREDIT_BALANCE',
        }),
		activeTabData() {
			return this.activeTab == 'All' ? this.allCreditData : this.userCreditData
		},
		lastTransactionDate() {
			if (this.activeTabData.length) {
				let lastTransactionDate = this.activeTabData[0].created_at
				return this.parseDate(lastTransactionDate)
			} else {
				return 'N/A'
			}
		}
	},
	methods: {
        isCrmUser,
		async fetchData() {
			this.isLoadingData = true

			let promises = []
			if (this.userIsAdmin) {
				let prom = API.CREDITS.GET_CREDIT_TRANSACTION_HISTORY(true).then(resp => {
					this.allCreditData = resp.data.results
					this.paginationData["All"].nextUrl = resp.data.next
				})
				promises.push(prom)
			} else {
				this.activeTab = "My Transactions"
			}

			let prom = API.CREDITS.GET_CREDIT_TRANSACTION_HISTORY(false).then(resp => {
				this.userCreditData = resp.data.results
				this.paginationData["My Transactions"].nextUrl = resp.data.next
			})
			promises.push(prom)

			await Promise.all(promises)
			this.isLoadingData = false
		},
		creditTypeText(creditType) {
			if (!creditType) { return 'Unknown' }
			return capitalizeFirstLetter(creditType) + ' Credits'
		},
		parseDate(dateString) {
			let date = new Date(dateString)
			let elems = date.toDateString().split(' ')
			let finalString = `${elems[2]} ${elems[1]} ${elems[3]}`
			return finalString
		},
		parseTime(dateString) {
			let date = new Date(dateString)
			return date.toLocaleString("en-IN", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			})
		},
		async loadMoreDataNew() {
			let activeDict = this.paginationData[this.activeTab]
			let activeArray = this.activeTab == "All" ? this.allCreditData : this.userCreditData
			let newList = await paginationHelper({
				origArray: activeArray,
				paginationDict: activeDict,
			})
      		if (newList) {
				if (this.activeTab == "All") {
					this.allCreditData = newList
				} else {
					this.userCreditData = newList
				}
			}
		},
		loadMoreData() {
			let activeDict = this.paginationData[this.activeTab]
			if (activeDict.copyUrl == activeDict.nextUrl) {
				return;
			}
			if (activeDict.nextUrl !== null) {
				activeDict.copyUrl = activeDict.nextUrl;
				activeDict.busy = true;
				this.loadMoreDataCaller();
			}
		},
		async loadMoreDataCaller() {
			let activeDict = this.paginationData[this.activeTab]
			try {
				const response = await API.CREDITS.LOAD_MORE_CREDIT_USAGE(activeDict.nextUrl);
				this.assignAPIResponse(response);
				activeDict.nextUrl = response.data.next;

				activeDict.busy = false;
			} catch (error) {
				// console.error();
			}
		},
		assignAPIResponse(response) {
			const data = response.data.results;
			let activeDict = this.paginationData[this.activeTab]
			if (this.activeTab == "All") {
				this.allCreditData = this.allCreditData.concat(data);
			} else {
				this.userCreditData = this.userCreditData.concat(data);
			}
			activeDict.nextUrl = response.data.next;
		},
		viewTransactionDetails(transaction) {
			this.curTransactionDetails = transaction.order_description.order_details
			this.isViewDetailsPopupVisible = true
		},
		creditText(creditCount) {
			if (Math.ceil(creditCount)) {
				return creditCount.toFixed(2) + ' Credits'
			} else {
				return '-'
			}
		},
		formatNumberWithCommas,
	},
	async created() {
		this.fetchData()
	}
};
</script>

<style scoped>
/* PENDING: Responsive css for table and the entire page as well */

.title {
	font-weight: 600;
}

.sub_title {
	color: var(--primary);
	font-size: 16px;
	font-weight: 600;
}

.credit_balance {
	display: flex;
	flex-direction: column;
	row-gap: 16px;
	flex: 1;
    min-width: 380px;
    max-width: 420px;
}

.credit_balance p {
	line-height: normal;
    color: var(--step-200);
    font-size: var(--f16);
    font-weight: 400;
    max-width: 100%;
    word-break: break-word;
	margin-bottom: 12px;
}

.credit-balance-container {
	display: flex;
    flex-direction: column;
    row-gap: 24px;
	column-gap: 24px;
}

.purchased {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.promotional {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
}

.purchased, .promotional {
    min-width: 380px;
    max-width: 420px;
}

.add_credit_btn {
	margin-top: 10px;
}

.title {
	font-weight: 600;
}

.cards_container {
	margin-top: 32px;
	display: flex;
	column-gap: 24px;
	row-gap: 24px;
}

@media (max-width: 1135px) {

.cards_container {
	flex-direction: column-reverse;
}

.credit-balance-container {
    flex-direction: row;
}

}

@media (max-width: 900px) {

.credit-balance-container {
    flex-direction: column;
}

}

.sub_title {
	color: var(--primary);
	font-size: 16px;
	font-weight: 600;
}

.credit_transaction {
	min-width: 680px;
    flex: 2.5;
}

.add_credit_btn {
	margin-top: 10px;
}

.right_section {
	background: var(--step-50);
}

.title_text {
	color : var(--primary);
	text-transform: uppercase;
	white-space: nowrap;
}

@media (min-width: 1281px) {
	.right_section {
		width: calc(100% - 260px);
		margin-left: auto;
	}
	.right_sectionCRM {
		width: calc(100% - 74px);
	}
}

.container >>> .el-tabs__nav {
  padding: 6px 24px !important;
}

.container >>> .el-tabs__active-bar {
  background-color: #1c3366 !important;
	margin: 0px 24px !important;
}

.container >>> .el-tabs__item {
  color: #777777;
  font-size: 18px !important;
  font-weight: 100 !important;
}

.container >>> .el-tabs__item.is-active {
  color: #1c3366 !important;
}

.container >>> .el-tabs__item:hover {
  color: #1c3366 !important;
  cursor: pointer;
}

.favorite_section {
  border: 1px solid var(--step-100);
  border-radius: 12px;
  background: var(--white);
  margin-top: 16px;
  width: auto;
}

.paginated-table {
	height: 60vh;
	overflow-x: auto;
	border-radius: 12px;
}

table {
  	border-collapse: collapse;
	text-align: left;
}

.headerSticky{
  position: sticky !important;
  top: 0px !important;
  background: white;
  /* z-index: 1 !important; */
}

thead tr {
  	border-bottom: 1pt solid #cccccc !important;
}

tr {
  	border-bottom: 1pt solid #cccccc;
}

table tr:last-child {
  	border: none;
}

th, td {
	padding: 10px;
}

.transaction-time {
	color: #777777;
	font-size: 14px;
}

#mobile_view {
	display: none;
}

#mobile_view tr {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 16px 16px 8px;
  padding: 16px 12px 16px 16px;
  border-radius: 4px;
  border: solid 1px #ccc;
  justify-content: space-between;
  column-gap: 4rem;
  row-gap: 1rem;
}

#mobile_view td {
	width: 8rem;

}

.viewDetails {
	color: #1c3366;
	font-size: 14px;
	font-weight: 600;
	text-decoration: underline;
	display: inline-block;
	margin-top: 6px;
	cursor: pointer;
}

@media (max-width: 767px) {
	.credit_transaction {
		min-width: 320px;
	}

	thead {
		display: none;
	}

	#pc_view {
		display: none;
	}
	
	#mobile_view {
		display: block;
	}

	.statusIcon {
		margin-top: 8px;
	}
}

@media (max-width: 440px) {
	.credit_balance {
    min-width: 300px;
	}
}



</style>