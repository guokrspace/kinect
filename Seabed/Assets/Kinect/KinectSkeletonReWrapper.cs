/*
 * This file is part of Kinect Game Project. http://www.mac-top.com.cn/
 *
 * Copyright (c) 2013 北京芒拓软件有限公司.  All rights reserved.
 *
 * Revision History
 * ----------------------------------------------------------------------------
 * Name   | Date       | Bug ID  | Changes
 * 王剑峰   2013-03-28   None      创建文件
 * ----------------------------------------------------------------------------
 */

using UnityEngine;
using System.Collections;

public class KinectSkeletonReWrapper : MonoBehaviour {
	//模型信息
	public KinectModelControllerV3 msw;
	//kinect原始信息
	public SkeletonWrapper sw;
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		if(msw!= null)
		{
			//模型点的四元数
			//msw.boneReDir
			//模型点的坐标
			//msw.boneRePos
		}
	}
}
