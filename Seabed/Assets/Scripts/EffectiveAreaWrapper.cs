/*
 * This file is part of Kinect Game Project. http://www.mac-top.com.cn/
 *
 * Copyright (c) 2013 北京芒拓软件有限公司.  All rights reserved.
 *
 * Revision History
 * ----------------------------------------------------------------------------
 * Name   | Date       | Bug ID  | Changes
 * 王剑峰   2013-04-07   None      创建文件
 * ----------------------------------------------------------------------------
 */
using UnityEngine;
using System.Collections;

public class EffectiveAreaWrapper : MonoBehaviour {

	public GUISkin gsEARed;
	public GUISkin gsEASon;
	public GUISkin gsEAFather;
	public SkeletonWrapper sw;
	private const float fpicWidth = 178.0F;
	private const float fpicHeight = 256.0F;
	private const float fpicCircleWidth = 33.0F;
	private const float fpicCircleHeight = 31.0F;
	//private float fpicCircleTmpWidth = 0.2F;
	private float fpicCircleTmpHeight = 0.6F;
	private int ii = 0;
	private int jj = 0;
	[HideInInspector]
	public int nPlayerFather;
	[HideInInspector]
	public int nPlayerSon;
	[HideInInspector]
	//public bool blnIsGamePlay;
	private bool blnGamePlay = false;
	private bool blnOneOrTwo = false;
	private const int nfTopPosMax = 190;
	private const int nfTopPosMin = 80;	
	private const int nfRightPosMax = 0;
	private const int nfRightPosMin = -150;
	
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
		blnGamePlay = false;
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	void caleAreaMove (int nIndex) {
		
		if(ii==5)
		{
			ii=0;
		}
		if(jj==10)
		{
			blnOneOrTwo = !blnOneOrTwo;
		}
		if(jj==-1)
		{
			blnOneOrTwo = !blnOneOrTwo;
		}
		
		float fTopPos = 155- fpicCircleTmpHeight - (sw.bonePos[nIndex, SKELETON_POSITION_SPINE].z - 1.0F)*100 - 100;
		
		if (fTopPos >= nfTopPosMax)
		{
			fTopPos = nfTopPosMax;
		}
		if (fTopPos <= nfTopPosMin)
		{
			fTopPos = nfTopPosMin;
		}
		float fRightPos = -75 + (sw.bonePos[nIndex,1].x)*100;

		if(fRightPos>=nfRightPosMax)
		{
			fRightPos = nfRightPosMax;
		}
		if(fRightPos <=nfRightPosMin)
		{
			fRightPos = nfRightPosMin;
		}
		if(sw.bonePos[nIndex, SKELETON_POSITION_SPINE].z!=0.0F)
		{
			Rect rectCircle = new Rect(Screen.width - fpicCircleWidth + fRightPos , fTopPos,fpicCircleWidth,fpicCircleHeight);
			GUI.Box(rectCircle,"", GUI.skin.GetStyle("box"));
		}
		
		ii++;
		if(ii==5)
		{
			if(blnOneOrTwo == false)
				jj++;
			else
				jj--;
		}
	}
	void OnGUI()
	{
		if(sw != null)
		{
		    if(sw.pollSkeleton()){
				if(sw.trackedPlayers[0] >= 0 & sw.trackedPlayers[1] >= 0)
				{
					blnGamePlay = true;
				}
				else if (sw.trackedPlayers[0] >= 0 & sw.trackedPlayers[1] == -1 )
				{
					GUI.skin = gsEARed;
					Rect rect = new Rect(Screen.width - fpicWidth, 0.0F,fpicWidth,fpicHeight);
					GUI.Box(rect,"", GUI.skin.GetStyle("box"));
					GUI.skin = gsEASon;
					caleAreaMove(0);
					//GUI.skin = gsEAFather;
					//caleAreaMove(0);
					blnGamePlay = false;
					//blnIsGamePlay = false;
				}
				else if (sw.trackedPlayers[0] ==-1 & sw.trackedPlayers[1] >=0 )
				{
					GUI.skin = gsEARed;
					Rect rect = new Rect(Screen.width - fpicWidth, 0.0F,fpicWidth,fpicHeight);
					GUI.Box(rect,"", GUI.skin.GetStyle("box"));
					GUI.skin = gsEASon;
					caleAreaMove(1);
					//GUI.skin = gsEAFather;
					//caleAreaMove(0);
					blnGamePlay = false;
					//blnIsGamePlay = false;
				}
				else
				{
					GUI.skin = gsEARed;
					Rect rect = new Rect(Screen.width - fpicWidth, 0.0F,fpicWidth,fpicHeight);
					GUI.Box(rect,"", GUI.skin.GetStyle("box"));
					blnGamePlay = false;
					//blnIsGamePlay = false;
				}
				if(blnGamePlay)
				{
					if(sw.bonePos[0, SKELETON_POSITION_HEAD].y >= sw.bonePos[1, SKELETON_POSITION_HEAD].y)
					{
						nPlayerFather = 0;
						nPlayerSon = 1;
					}
					else
					{
						nPlayerFather = 1;
						nPlayerSon = 0;
					}
					if((sw.bonePos[nPlayerSon, SKELETON_POSITION_SPINE].z - 1.0F) < -1.0F || 
				   	   (sw.bonePos[nPlayerSon, SKELETON_POSITION_SPINE].z - 1.0F) > 1.0F ||
				       (sw.bonePos[nPlayerSon, SKELETON_POSITION_SPINE].x < -1.0F) ||
				       (sw.bonePos[nPlayerSon, SKELETON_POSITION_SPINE].x > 1.0F)||
					   (sw.bonePos[nPlayerFather, SKELETON_POSITION_SPINE].z - 1.0F) < -1.0F || 
				   	   (sw.bonePos[nPlayerFather, SKELETON_POSITION_SPINE].z - 1.0F) > 1.0F ||
				       (sw.bonePos[nPlayerFather, SKELETON_POSITION_SPINE].x < -1.0F) ||
				       (sw.bonePos[nPlayerFather, SKELETON_POSITION_SPINE].x > 1.0F))
					{
						GUI.skin = gsEARed;
						Rect rect = new Rect(Screen.width - fpicWidth, 0.0F,fpicWidth,fpicHeight);
						GUI.Box(rect,"", GUI.skin.GetStyle("box"));
						GUI.skin = gsEASon;
						caleAreaMove(nPlayerSon);
						GUI.skin = gsEAFather;
						caleAreaMove(nPlayerFather);
						//blnIsGamePlay = false;
					}
					else
					{
						//blnIsGamePlay = true;
					}
	
				}
				else
				{
					nPlayerSon = -1;
					nPlayerFather = -1;
				}
			}
			else
			{
				nPlayerSon = -1;
				nPlayerFather = -1;			
			}
		}
		
	}
}
