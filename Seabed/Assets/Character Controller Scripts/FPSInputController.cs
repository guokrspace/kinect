/*
 * This file is part of Kinect Game Project. http://www.mac-top.com.cn/
 *
 * Copyright (c) 2013 北京芒拓软件有限公司.  All rights reserved.
 *
 * Revision History
 * ----------------------------------------------------------------------------
 * Name   | Date       | Bug ID  | Changes
 * 王剑峰   2013-04-03   None      创建文件
 * ----------------------------------------------------------------------------
 */
using UnityEngine;
using System;
using System.Collections;

public class FPSInputController : MonoBehaviour {

	private CharacterMotor motor ;
	public SkeletonWrapper sw;
	[HideInInspector]
	public int player;
	public GeometryWrapper gw;
	[HideInInspector]
	public Vector3 directionVector;
	public EffectiveAreaWrapper eaw;
	[HideInInspector]
	public bool isCanAttract;
	[HideInInspector]
	public bool isKinectable;
	[HideInInspector]
	public Vector3 targetPos = Vector3.zero;
	
	private NavMeshAgent playerNav;
	private Transform fatherTransform;

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
	
	private int nAngleShoulderToElbow = 40;
	private const float fLeftAndRightDist = 0.2F;
	private const float fMoveValueZ = 0.5F;
	private const float fMoveValueX = 0.5F;
	private const float fMoveValueY = 0.5F;
	private const float fDistHandsSpine = 0.2F;
	
	
	void Awake () {
		motor = GetComponent<CharacterMotor>();
		playerNav = GetComponent<NavMeshAgent>();
		fatherTransform = GameObject.FindGameObjectWithTag("father").transform;
	}
	void Start() {
		isCanAttract = true;
		isKinectable = true;
	}
	void Update () {
		
		//Debug.Log("isKinect" + isKinectable);
		if(isKinectable)
		{
			//重置变量
			playerNav.enabled = false;
			targetPos = Vector3.zero;
			
			if(eaw != null)
			{
				player = eaw.nPlayerSon;
				if(player ==-1)
				{
					Vector3 vec2 = new Vector3();
					vec2.Set(0.0F,0.0F,0.0F);
					directionVector = vec2;
					motor.inputMoveDirection = transform.rotation * directionVector;
					return;
				}
			}
			else
			{
				Vector3 vec2 = new Vector3();
				vec2.Set(0.0F,0.0F,0.0F);
				directionVector = vec2;
				motor.inputMoveDirection = transform.rotation * directionVector;
				return;
			}
			if(sw!=null)
			{
				if(sw.pollSkeleton()){
					if(sw.trackedPlayers[player] >=	 0)
					{					
						Vector3 vecDirLeft = new Vector3();
						Vector3	vecDirRight = new Vector3();
						vecDirLeft.Set(sw.bonePos[player,SKELETON_POSITION_HAND_LEFT].x - sw.bonePos[player,SKELETON_POSITION_ELBOW_LEFT].x,
									   sw.bonePos[player,SKELETON_POSITION_HAND_LEFT].y - sw.bonePos[player,SKELETON_POSITION_ELBOW_LEFT].y,
									   sw.bonePos[player,SKELETON_POSITION_HAND_LEFT].z - sw.bonePos[player,SKELETON_POSITION_ELBOW_LEFT].z);
						vecDirLeft = gw.geo_VecUnit(vecDirLeft);
						double dblAngleLeft = gw.geo_2VectorAngle(Vector3.up, vecDirLeft);
						dblAngleLeft = dblAngleLeft * 180/ Math.PI;
						if(dblAngleLeft>90)
						{
							dblAngleLeft = 180 - dblAngleLeft;
						}
						vecDirRight.Set(sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].x - sw.bonePos[player,SKELETON_POSITION_ELBOW_RIGHT].x,
					                    sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].y - sw.bonePos[player,SKELETON_POSITION_ELBOW_RIGHT].y,
					                    sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].z - sw.bonePos[player,SKELETON_POSITION_ELBOW_RIGHT].z);
						vecDirRight = gw.geo_VecUnit(vecDirRight);
						double dblAngleRight = gw.geo_2VectorAngle(Vector3.up, vecDirRight);
						dblAngleRight = dblAngleRight * 180/ Math.PI;
						if(dblAngleRight>90)
						{
							dblAngleRight = 180 - dblAngleRight;
						}
						//float aa = Math.Abs(sw.bonePos[player,SKELETON_POSITION_HAND_LEFT].z - sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].z);
						if (Math.Abs(sw.bonePos[player,SKELETON_POSITION_HAND_LEFT].z - sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].z) > fLeftAndRightDist &&
							 (dblAngleLeft>nAngleShoulderToElbow ||
							 dblAngleRight>nAngleShoulderToElbow))
						{
							Vector3 vec1 = new Vector3();
							
							directionVector = vec1;
							float fDistTwoHands = 0.0F;
							fDistTwoHands = (sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].x + sw.bonePos[player,SKELETON_POSITION_HAND_LEFT].x)/2;
							if(sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].y > sw.bonePos[player,SKELETON_POSITION_SHOULDER_CENTER].y)
							{
								/*
								if(fDistTwoHands - sw.bonePos[player,SKELETON_POSITION_SPINE].x > 0 &&
									Math.Abs(fDistTwoHands - sw.bonePos[player,SKELETON_POSITION_SPINE].x) > fDistHandsSpine)
								{
									vec1.Set(-fMoveValueX,-fMoveValueY,-fMoveValueZ);
								}
								else if(fDistTwoHands - sw.bonePos[player,SKELETON_POSITION_SPINE].x < 0 &&
									Math.Abs(fDistTwoHands - sw.bonePos[player,SKELETON_POSITION_SPINE].x) > fDistHandsSpine)
								{
									vec1.Set(fMoveValueX,-fMoveValueY,-fMoveValueZ);
								}
								else
								{
									vec1.Set(0.0F,-fMoveValueY,-fMoveValueZ);
								}
								*/
								vec1.Set(0.0F,-fMoveValueY,-fMoveValueZ);
							}
							else
							{
								/*
								if(fDistTwoHands - sw.bonePos[player,SKELETON_POSITION_SPINE].x > 0 &&
									Math.Abs(fDistTwoHands - sw.bonePos[player,SKELETON_POSITION_SPINE].x) > fDistHandsSpine)
								{
									vec1.Set(-fMoveValueX,fMoveValueY,-fMoveValueZ);
								}
								else if(fDistTwoHands - sw.bonePos[player,SKELETON_POSITION_SPINE].x < 0 &&
									Math.Abs(fDistTwoHands - sw.bonePos[player,SKELETON_POSITION_SPINE].x) > fDistHandsSpine)
								{
									vec1.Set(fMoveValueX,fMoveValueY,-fMoveValueZ);
								}
								else
								{
									vec1.Set(0.0F,fMoveValueY,-fMoveValueZ);
								}
								*/
								vec1.Set(0.0F,fMoveValueY,-fMoveValueZ);
							}
							directionVector = vec1;
						}
						else
						{
							Vector3 vec2 = new Vector3();
							vec2.Set(0.0F,0.0F,0.0F);
							directionVector = vec2;
						}
					}
					else
					{
						Vector3 vec2 = new Vector3();
						vec2.Set(0.0F,0.0F,0.0F);
						directionVector = vec2;
					}
				}
				else
				{
					Vector3 vec2 = new Vector3();
					vec2.Set(0.0F,0.0F,0.0F);
					directionVector = vec2;
				}
			}
			//directionVector = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
			if (directionVector != Vector3.zero) {
				// Get the length of the directon vector and then normalize it
				// Dividing by the length is cheaper than normalizing when we already have the length anyway
				var directionLength = directionVector.magnitude;
				directionVector = directionVector / directionLength;
		
				// Make sure the length is no bigger than 1
				directionLength = Mathf.Min(1, directionLength);
		
				// Make the input vector more sensitive towards the extremes and less sensitive in the middle
				// This makes it easier to control slow speeds when using analog sticks
				directionLength = directionLength * directionLength;
		
				// Multiply the normalized direction vector by the modified length
				directionVector = directionVector * directionLength;
			}
			//directionVector = Vector3.right * 5F;
			motor.inputMoveDirection = transform.rotation * directionVector;
			motor.inputJump = Input.GetButtonUp("Jump");
			//motor.inputJump = Input.GetButton("Fire1");
				//motor.inputJump = true;
		}
		else//自动寻路
		{
			Vector3 vec2 = new Vector3();
			vec2.Set(0.0F,0.0F,0.0F);
			directionVector = vec2;
			motor.inputMoveDirection = transform.rotation * directionVector;
			motor.inputJump = Input.GetButtonUp("Jump");
			
			
			playerNav.enabled = true;
			targetPos = new Vector3(fatherTransform.position.x,fatherTransform.position.y,fatherTransform.position.z + 5);
			playerNav.SetDestination(targetPos);

		}
		
		}
	
	}