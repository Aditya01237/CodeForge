#include<bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int,int> mp;
    for(int i=0;i<nums.size();i++){
        if(mp.find(nums[i]) != mp.end()){
            return {mp[nums[i]],i};
        }else{
            mp[target-nums[i]] = i;
        }
    }
    return {-1,-1};
}

int main() {
    int t;
    cin >> t;
    while(t--){
        int n,target;
        cin >> n;
        vector<int> arr(n);
        for(int i=0;i<n;i++)cin >> arr[i];
        cin >> target;
        vector<int> ans = twoSum(arr,target);
        cout << ans[0] << " " << ans[1] << "\n";
    }
    return 0;
}