
/*
 * This file is part of Kinect Game Project. http://www.mac-top.com.cn/
 *
 * Copyright (c) 2013 北京芒拓软件有限公司.  All rights reserved.
 *
 * Revision History
 * ----------------------------------------------------------------------------
 * Name   | Date       | Bug ID  | Changes
 * 温培方   2013-04-09   None      创建文件
 * 杨清夙   2013-04-10   None      为第一关游戏创建随机鱼 
 * ----------------------------------------------------------------------------
 */

using UnityEngine;
using System.Collections;

public class RamdomFish : MonoBehaviour {

    public GameObject fishType1;
    public GameObject fishType2;
    public GameObject fishType3;
    public GameObject fishType4;
    public GameObject fishType5;
    public GameObject fishType6;
    public GameObject[] prefeb;
	
	// 鱼群出现在前方20米，半径为10米的一个区域内
	private const int   nFishClusterCount = 3;
    private const float ffrontDistance =50.0F;
    private const float fbackDistance = 30.0F;
	
    private const float fTopDistance = 10.0F;
    private const float fbottomDistance = -10.0F;
	
    public GameObject[,] fish = new GameObject[3,10] ;
	
    private int ifishcount=0;
	
	// Use this for initialization
	void Start () {
		
        prefeb = new GameObject[6];
        //(fishType1, fishType2, fishType3, fishType4, fishType5,fishType6);
        prefeb[0] = fishType1;
        prefeb[1] = fishType2;
        prefeb[2] = fishType3;
        prefeb[3] = fishType4;
        prefeb[4] = fishType5;
        prefeb[5] = fishType6;	
		
		// 创建3个鱼群 
		for (int j=0; j<nFishClusterCount; j++)
		{
	       
	        for (int i=0;i<10;i++)
	        {
	            float x = Random.Range(fbackDistance, ffrontDistance);
	            float y = Random.Range(j*50 - 50, j*50 - 30);
	            float z = Random.Range(fTopDistance, fbottomDistance);
				
	            Vector3 position = gameObject.transform.position;
	            Debug.Log("arrar counmt" + fish.Length);
	            // 
	            int witchFish = Random.Range(0, 5);
	            // Instantiate(prefeb1,new Vector3(),prefeb1.);
	            GameObject a = Instantiate(prefeb[witchFish], new Vector3(position.x + x, position.y + y, position.z + z), Quaternion.identity) as GameObject;
	            //a.AddComponent("AI_Controller");
	            Debug.Log("aaaaaaaaa" + a);
	            fish[j,i] = a;
	           
	        }
		}
       
	}
	
	// Update is called once per frame
	void Update () {
		/*
	    Vector3 position=  gameObject.transform.position;

	    for (int i = 0; i < 10; i++)
	    {
	        float x = Random.Range(fbackDistance, ffrontDistance);
            float y = Random.Range(frightDistance, fLeftDistance);
	        float z = Random.Range(fTopDistance, fbottomDistance);
	        GameObject a = (GameObject)fish[i];
			
            //Debug.Log("fish i"+a);
	
	        //Vector3 vctPosintion =;
	        //Debug.Log("????????????????????????????????????????????????????"+position.x);
	        
	        if (Mathf.Abs(position.x - fish[i].transform.position.x) > ffrontDistance || Mathf.Abs(position.y - fish[i].transform.position.y) > fTopDistance || Mathf.Abs(position.z - fish[i].transform.position.z) > fLeftDistance)
	        {
	            //Debug.Log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~destory");
	            Destroy(fish[i]);
	
	            int witchFish = Random.Range(0, 5);
	            GameObject ab = Instantiate(prefeb[witchFish], new Vector3(position.x + x, position.y + y, position.z + z), Quaternion.identity) as GameObject;
	              //ab.AddComponent("AI_Controller");
	            fish[i]=ab;
	             
	          }
	
	     }

      Debug.Log(ifishcount);
      */
     

	}
}
