/*
 * This file is part of Kinect Game Project. http://www.mac-top.com.cn/
 *
 * Copyright (c) 2013 北京芒拓软件有限公司.  All rights reserved.
 *
 * Revision History
 * ----------------------------------------------------------------------------
 * Name   | Date       | Bug ID  | Changes
 * 王剑峰   2013-04-08   None      创建文件
 * ----------------------------------------------------------------------------
 */
using UnityEngine;
using System.Collections;

public class FatherController : MonoBehaviour {
	
	public SkeletonWrapper sw;
	public GeometryWrapper gw;
	public EffectiveAreaWrapper eaw;
	private int nPlayer;
	private int nIndexStatus;
	[HideInInspector]
	public bool blnIsHaving;
	
	private const int SKELETON_POSITION_HIP_CENTER = 0;
	private const int SKELETON_POSITION_SPINE = 1;
	private const int SKELETON_POSITION_SHOULDER_CENTER = 2;
	private const int SKELETON_POSITION_HEAD = 3;
	private const int SKELETON_POSITION_SHOULDER_LEFT = 4;
	private const int SKELETON_POSITION_ELBOW_LEFT = 5;
	private const int SKELETON_POSITION_WRIST_LEFT = 6;
	private const int SKELETON_POSITION_HAND_LEFT = 7;
	private const int SKELETON_POSITION_SHOULDER_RIGHT = 8;
	private const int SKELETON_POSITION_ELBOW_RIGHT = 9;
	private const int SKELETON_POSITION_WRIST_RIGHT = 10;
	private const int SKELETON_POSITION_HAND_RIGHT = 11;
	private const int SKELETON_POSITION_HIP_LEFT = 12;
	private const int SKELETON_POSITION_KNEE_LEFT = 13;
	private const int SKELETON_POSITION_ANKLE_LEFT = 14;
	private const int SKELETON_POSITION_FOOT_LEFT = 15;
	private const int SKELETON_POSITION_HIP_RIGHT = 16;
	private const int SKELETON_POSITION_KNEE_RIGHT = 17;
	private const int SKELETON_POSITION_ANKLE_RIGHT = 18;
	private const int SKELETON_POSITION_FOOT_RIGHT = 19;
	// Use this for initialization
	void Start () {
		nIndexStatus = 0;
		blnIsHaving = false;
	}
	
	// Update is called once per frame
	void Update () {
		
		if(eaw != null)
		{
			nPlayer = eaw.nPlayerFather;
			if(nPlayer ==-1)
			{
				return;
			}
		}
		else
		{
			return;
		}
		if(sw!=null)
		{
			if(sw.pollSkeleton()){
				if(sw.trackedPlayers[nPlayer] >= 0)
				{
					blnIsHaving = false;
					//Debug.Log(sw.bonePos[nPlayer, SKELETON_POSITION_HAND_LEFT].x);
					if (sw.bonePos[nPlayer, SKELETON_POSITION_HAND_RIGHT].x - sw.bonePos[nPlayer, SKELETON_POSITION_HAND_LEFT].x > 1.0)
					{
						nIndexStatus =1;
						blnIsHaving = false;
					}
					else if ((sw.bonePos[nPlayer, SKELETON_POSITION_HAND_RIGHT].x - sw.bonePos[nPlayer, SKELETON_POSITION_HAND_LEFT].x <0.2) && nIndexStatus ==1)
					{
						nIndexStatus =0;
						blnIsHaving = true;
						Debug.Log("OK");
					}
					//sw.bonePos[player, SKELETON_POSITION_HAND_LEFT].x;
				}
			}
		}
	}
}
